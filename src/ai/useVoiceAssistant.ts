import { useCallback, useEffect, useRef, useState } from "react";
import { pcmBase64ToWavBlob, pcmToWavBase64 } from "./audio";
import {
  askGeminiWithAudio,
  hasGeminiKey,
  synthesizeSpeech,
} from "./gemini";

export type VoiceState =
  | "idle"
  | "recording"
  | "processing"
  | "speaking"
  | "error";

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find((v) => /es(-|_)?(ES|MX|US|419)?/i.test(v.lang) && /Google|Microsoft/i.test(v.name)) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("es")) ||
    undefined
  );
}

export function useVoiceAssistant(context: string) {
  const [state, setState] = useState<VoiceState>("idle");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [level, setLevel] = useState(0);

  const contextRef = useRef(context);
  contextRef.current = context;

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef<number>(48000);
  const rafRef = useRef<number>(0);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUrlRef = useRef<string | null>(null);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    (typeof AudioContext !== "undefined" ||
      typeof (window as unknown as { webkitAudioContext?: unknown })
        .webkitAudioContext !== "undefined");

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setLevel(0);
  }, []);

  // Cierra los nodos de captura PCM y el AudioContext.
  const teardownAudio = useCallback(() => {
    try {
      processorRef.current?.disconnect();
    } catch {
      /* noop */
    }
    try {
      sourceRef.current?.disconnect();
    } catch {
      /* noop */
    }
    processorRef.current = null;
    sourceRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const cleanupTtsAudio = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.onended = null;
      ttsAudioRef.current.onerror = null;
      ttsAudioRef.current.onplay = null;
      ttsAudioRef.current.pause();
      ttsAudioRef.current.src = "";
      ttsAudioRef.current = null;
    }
    if (ttsUrlRef.current) {
      URL.revokeObjectURL(ttsUrlRef.current);
      ttsUrlRef.current = null;
    }
  }, []);

  // Respaldo: voz del navegador (si el TTS de Gemini falla). Muestra el texto
  // justo cuando arranca la locución para que aparezcan sincronizados.
  const speakFallback = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setAnswer(text);
      setState("idle");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 1.02;
    u.pitch = 1.05;
    const v = pickSpanishVoice();
    if (v) u.voice = v;
    u.onstart = () => {
      setAnswer(text);
      setState("speaking");
    };
    u.onend = () => setState("idle");
    u.onerror = () => {
      setAnswer(text);
      setState("idle");
    };
    setState("speaking");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    // Si por alguna razón no dispara onstart, mostramos el texto igualmente.
    window.setTimeout(() => setAnswer((a) => a || text), 350);
  }, []);

  // Voz natural con el modelo TTS de Gemini; respaldo al navegador.
  // El texto se revela en el momento en que empieza a sonar la voz.
  const speak = useCallback(
    async (text: string) => {
      cleanupTtsAudio();
      try {
        const { base64, sampleRate } = await synthesizeSpeech(text);
        const blob = pcmBase64ToWavBlob(base64, sampleRate);
        const url = URL.createObjectURL(blob);
        ttsUrlRef.current = url;
        const audio = new Audio(url);
        ttsAudioRef.current = audio;
        audio.onplay = () => {
          setAnswer(text);
          setState("speaking");
        };
        audio.onended = () => {
          cleanupTtsAudio();
          setState("idle");
        };
        audio.onerror = () => {
          cleanupTtsAudio();
          speakFallback(text);
        };
        await audio.play();
      } catch {
        speakFallback(text);
      }
    },
    [cleanupTtsAudio, speakFallback]
  );

  // Procesa el PCM capturado en vivo (sin decodeAudioData) y consulta a Gemini.
  const finalizeRecording = useCallback(async () => {
    stopMeter();
    setState("processing");
    const inputRate = sampleRateRef.current;
    const chunks = pcmChunksRef.current;
    pcmChunksRef.current = [];
    teardownAudio();
    stopStream();
    try {
      const total = chunks.reduce((n, c) => n + c.length, 0);
      if (total < inputRate * 0.2) {
        setError(
          "No capté tu voz. Mantén pulsado el botón mientras hablas y suéltalo al terminar."
        );
        setState("error");
        return;
      }
      const merged = new Float32Array(total);
      let off = 0;
      for (const c of chunks) {
        merged.set(c, off);
        off += c.length;
      }
      const { base64, mimeType, durationSec, rms } = pcmToWavBase64(
        merged,
        inputRate
      );
      if (durationSec < 0.4 || rms < 0.0035) {
        setError(
          "No te escuché bien. Acerca el micrófono y habla un poco más fuerte mientras mantienes pulsado."
        );
        setState("error");
        return;
      }
      const text = await askGeminiWithAudio(base64, mimeType, contextRef.current);
      // El texto se mostrará justo cuando comience a sonar la voz (en speak).
      await speak(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el audio");
      setState("error");
    }
  }, [speak, stopMeter, stopStream, teardownAudio]);

  const startRecording = useCallback(async () => {
    if (!supported) {
      setError("Tu navegador no soporta grabación de audio.");
      setState("error");
      return;
    }
    if (!hasGeminiKey()) {
      setError("Falta configurar la clave de Gemini (VITE_GEMINI_API_KEY).");
      setState("error");
      return;
    }
    setError("");
    setAnswer("");
    window.speechSynthesis?.cancel();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const actx = new AC();
      audioCtxRef.current = actx;
      actx.resume?.();
      sampleRateRef.current = actx.sampleRate;

      const src = actx.createMediaStreamSource(stream);
      sourceRef.current = src;

      // Captura PCM en vivo (sin contenedor → nunca falla la decodificación).
      pcmChunksRef.current = [];
      const processor = actx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      let levelSmoothed = 0;
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(input));
        // medidor de nivel (RMS suavizado)
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / input.length);
        levelSmoothed = levelSmoothed * 0.7 + Math.min(1, rms * 6) * 0.3;
        setLevel(levelSmoothed);
      };

      // Conectar a un nodo silencioso para que el procesador corra sin eco.
      const silent = actx.createGain();
      silent.gain.value = 0;
      src.connect(processor);
      processor.connect(silent);
      silent.connect(actx.destination);

      setState("recording");
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos.");
      setState("error");
      stopMeter();
      teardownAudio();
      stopStream();
    }
  }, [supported, stopMeter, teardownAudio, stopStream]);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      // Pequeño margen para capturar la última palabra antes de cerrar.
      window.setTimeout(() => {
        void finalizeRecording();
      }, 160);
    } else {
      stopMeter();
      teardownAudio();
      stopStream();
    }
  }, [finalizeRecording, stopMeter, teardownAudio, stopStream]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    cleanupTtsAudio();
    setState("idle");
  }, [cleanupTtsAudio]);

  const reset = useCallback(() => {
    window.speechSynthesis?.cancel();
    cleanupTtsAudio();
    pcmChunksRef.current = [];
    stopMeter();
    teardownAudio();
    stopStream();
    setState("idle");
    setAnswer("");
    setError("");
  }, [stopMeter, stopStream, teardownAudio, cleanupTtsAudio]);

  useEffect(() => {
    // precargar voces
    window.speechSynthesis?.getVoices?.();
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    answer,
    error,
    level,
    supported,
    hasKey: hasGeminiKey(),
    startRecording,
    stopRecording,
    stopSpeaking,
    reset,
  };
}
