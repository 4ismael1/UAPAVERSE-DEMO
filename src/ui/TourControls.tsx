import { AnimatePresence, motion } from "framer-motion";
import { useFeria } from "../store";
import { STATIONS } from "../data/feria";

export default function TourControls() {
  const tourActive = useFeria((s) => s.tourActive);
  const tourIndex = useFeria((s) => s.tourIndex);
  const next = useFeria((s) => s.nextTour);
  const prev = useFeria((s) => s.prevTour);
  const stop = useFeria((s) => s.stopTour);
  const openStation = useFeria((s) => s.openStation);

  const station = STATIONS[tourIndex];
  const total = STATIONS.length;

  return (
    <AnimatePresence>
      {tourActive && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(92vw,560px)] -translate-x-1/2"
        >
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3">
            <button
              onClick={prev}
              disabled={tourIndex === 0}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white transition hover:bg-white/15 disabled:opacity-30"
            >
              ←
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div
                className="text-[10px] font-bold tracking-wider"
                style={{ color: station?.accent }}
              >
                PARADA {tourIndex + 1} / {total} ·{" "}
                {station?.kind === "carrera" ? "CARRERA" : "PROYECTO"}
              </div>
              <button
                onClick={() => station && openStation(station)}
                className="block w-full truncate font-display text-base font-bold text-white hover:underline"
              >
                {station?.title}
              </button>
            </div>

            <button
              onClick={next}
              disabled={tourIndex >= total - 1}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white transition hover:bg-white/15 disabled:opacity-30"
            >
              →
            </button>
            <button
              onClick={stop}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/20"
            >
              Salir
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
