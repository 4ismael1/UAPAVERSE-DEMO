import { useEffect, useRef } from "react";
import { useFeria } from "../store";

// Ambiente sonoro sintetizado con Web Audio (sin archivos externos):
// un pad suave con dos osciladores ligeramente desafinados, filtro
// pasa-bajos y un LFO lento de volumen. Volumen muy bajo.
export function useAmbientAudio() {
  const audioOn = useFeria((s) => s.audioOn);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioOn) {
      if (gainRef.current && ctxRef.current) {
        const now = ctxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setTargetAtTime(0, now, 0.4);
      }
      return;
    }

    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!ctxRef.current) ctxRef.current = new AC();
    const ctx = ctxRef.current;
    ctx.resume?.();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    gainRef.current = master;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.connect(master);

    const freqs = [110, 110.4, 164.81];
    const oscs = freqs.map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.18;
      o.connect(g);
      g.connect(filter);
      o.start();
      return o;
    });

    // LFO de volumen
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();

    const now = ctx.currentTime;
    master.gain.setTargetAtTime(0.09, now, 0.8);

    return () => {
      const t = ctx.currentTime;
      master.gain.setTargetAtTime(0, t, 0.3);
      setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* noop */
          }
        });
        try {
          lfo.stop();
        } catch {
          /* noop */
        }
      }, 500);
    };
  }, [audioOn]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close?.();
    };
  }, []);
}
