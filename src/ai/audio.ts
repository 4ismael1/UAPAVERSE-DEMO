// Utilidades de audio: convierte el audio grabado (webm/ogg/mp4) a WAV PCM
// 16-bit mono, formato que el modelo de Gemini acepta de forma fiable.

function getAudioContext(): AudioContext {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  return new AC();
}

function downmixToMono(buffer: AudioBuffer): Float32Array {
  const ch = buffer.numberOfChannels;
  if (ch === 1) return buffer.getChannelData(0).slice();
  const len = buffer.length;
  const out = new Float32Array(len);
  for (let c = 0; c < ch; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) out[i] += data[i] / ch;
  }
  return out;
}

function downsample(
  input: Float32Array,
  inputRate: number,
  targetRate: number
): Float32Array {
  if (targetRate >= inputRate) return input;
  const ratio = inputRate / targetRate;
  const newLen = Math.round(input.length / ratio);
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += input[j];
      count++;
    }
    out[i] = count ? sum / count : 0;
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Amplifica (normaliza) la señal para que la voz suene clara aunque se haya
 *  grabado bajita, sin saturar. Devuelve el pico aplicado. */
function normalize(samples: Float32Array, maxGain = 12): Float32Array {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  if (peak < 1e-4) return samples; // prácticamente silencio
  const gain = Math.min(maxGain, 0.97 / peak);
  if (gain <= 1.01) return samples;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = Math.max(-1, Math.min(1, samples[i] * gain));
  }
  return out;
}

function rmsOf(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, samples.length));
}

/**
 * Codifica muestras PCM (Float32, capturadas en vivo con Web Audio) a WAV
 * base64 16-bit mono. No usa decodeAudioData, así que no falla por contenedor.
 */
export function pcmToWavBase64(
  samples: Float32Array,
  inputRate: number,
  targetRate = 16000
): { base64: string; mimeType: string; durationSec: number; rms: number } {
  const rate = Math.min(targetRate, inputRate);
  const down = downsample(samples, inputRate, rate);
  const rms = rmsOf(down);
  const normalized = normalize(down);
  const wav = encodeWav(normalized, rate);
  return {
    base64: arrayBufferToBase64(wav),
    mimeType: "audio/wav",
    durationSec: samples.length / inputRate,
    rms,
  };
}

export async function blobToWavBase64(
  blob: Blob,
  targetRate = 16000
): Promise<{
  base64: string;
  mimeType: string;
  durationSec: number;
  rms: number;
}> {
  const arrayBuf = await blob.arrayBuffer();
  const ctx = getAudioContext();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
    const mono = downmixToMono(decoded);
    const rate = Math.min(targetRate, decoded.sampleRate);
    const samples = downsample(mono, decoded.sampleRate, rate);
    const rms = rmsOf(samples);
    const normalized = normalize(samples);
    const wav = encodeWav(normalized, rate);
    return {
      base64: arrayBufferToBase64(wav),
      mimeType: "audio/wav",
      durationSec: decoded.duration,
      rms,
    };
  } finally {
    ctx.close();
  }
}

/** Envuelve PCM16 (base64, del TTS de Gemini) en un Blob WAV reproducible. */
export function pcmBase64ToWavBlob(
  base64: string,
  sampleRate: number,
  numChannels = 1
): Blob {
  const binary = atob(base64);
  const pcm = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) pcm[i] = binary.charCodeAt(i);

  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  const byteRate = sampleRate * numChannels * 2;
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, pcm.length, true);
  return new Blob([header, pcm], { type: "audio/wav" });
}

/** Elige un mimeType soportado por MediaRecorder. */
export function pickRecorderMime(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return undefined;
  return candidates.find((c) => MediaRecorder.isTypeSupported(c));
}
