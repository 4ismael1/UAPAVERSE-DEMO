import { useEffect, useRef } from "react";
import { useFeria } from "../store";

// Música de fondo (archivo real). Suena en bucle a volumen medio y baja casi
// al mínimo mientras hay un modal de stand abierto (para no molestar al ver el
// video), volviendo a la normalidad al cerrarlo.
const SRC = `${import.meta.env.BASE_URL}music/ambient.mp3`;
// Al abrir un modal atenuamos el volumen actual a esta fracción (casi mínimo).
const DUCK_FACTOR = 0.18;

export function useAmbientAudio() {
  const audioOn = useFeria((s) => s.audioOn);
  const volume = useFeria((s) => s.volume);
  const modalOpen = useFeria((s) => s.activeStation !== null);
  const elRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number>(0);

  // Crear el elemento de audio una sola vez.
  useEffect(() => {
    const el = new Audio(SRC);
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    elRef.current = el;
    return () => {
      cancelAnimationFrame(fadeRef.current);
      el.pause();
      el.src = "";
      elRef.current = null;
    };
  }, []);

  // Reproducir o pausar según el interruptor de audio.
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (audioOn) {
      el.play().catch(() => {
        /* el navegador puede bloquear hasta que haya interacción */
      });
    } else {
      el.pause();
    }
  }, [audioOn]);

  // Fundido suave del volumen hacia el objetivo (apagado / ajustado / atenuado).
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const target = !audioOn ? 0 : modalOpen ? volume * DUCK_FACTOR : volume;
    cancelAnimationFrame(fadeRef.current);
    const step = () => {
      const diff = target - el.volume;
      if (Math.abs(diff) < 0.005) {
        el.volume = Math.max(0, Math.min(1, target));
        return;
      }
      el.volume = Math.max(0, Math.min(1, el.volume + diff * 0.09));
      fadeRef.current = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(fadeRef.current);
  }, [audioOn, modalOpen, volume]);
}
