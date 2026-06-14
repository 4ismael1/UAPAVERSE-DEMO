import { useCallback, useEffect, useRef, useState } from "react";
import { blobToWavBase64, pickRecorderMime } from "./audio";
import { askGeminiWithAudio, hasGeminiKey } from "./gemini";

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
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setLevel(0);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setState("idle");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 1.05;
    u.pitch = 1.0;
    const v = pickSpanishVoice();
    if (v) u.voice = v;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    setState("speaking");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, []);

  const handleStop = useCallback(async () => {
    stopMeter();
    setState("processing");
    try {
      const type = chunksRef.current[0]?.type || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      stopStream();
      if (blob.size < 1400) {
        setState("idle");
        return;
      }
      const { base64, mimeType } = await blobToWavBase64(blob);
      const text = await askGeminiWithAudio(base64, mimeType, contextRef.current);
      setAnswer(text);
      speak(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el audio");
      setState("error");
    }
  }, [speak, stopMeter, stopStream]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // medidor de nivel
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const actx = new AC();
      audioCtxRef.current = actx;
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 3.2));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mime = pickRecorderMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = handleStop;
      recorderRef.current = rec;
      rec.start();
      setState("recording");
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos.");
      setState("error");
      stopMeter();
      stopStream();
    }
  }, [supported, handleStop, stopMeter, stopStream]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopMeter();
      stopStream();
    }
  }, [stopMeter, stopStream]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        /* noop */
      }
    }
    stopMeter();
    stopStream();
    setState("idle");
    setAnswer("");
    setError("");
  }, [stopMeter, stopStream]);

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
