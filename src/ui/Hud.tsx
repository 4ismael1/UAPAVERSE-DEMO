import { AnimatePresence, motion } from "framer-motion";
import { useFeria } from "../store";
import { CARRERA_STATIONS, FERIA } from "../data/feria";

export default function Hud() {
  const nearby = useFeria((s) => s.nearbyStand);
  const openStation = useFeria((s) => s.openStation);
  const goToStand = useFeria((s) => s.goToStand);
  const audioOn = useFeria((s) => s.audioOn);
  const toggleAudio = useFeria((s) => s.toggleAudio);
  const startTour = useFeria((s) => s.startTour);
  const tourActive = useFeria((s) => s.tourActive);
  const activeStation = useFeria((s) => s.activeStation);

  const hideCenter = !!activeStation;

  return (
    <>
      {/* ====== barra superior ====== */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="glass pointer-events-auto rounded-2xl px-4 py-2.5">
          <div className="text-[10px] font-semibold tracking-widest text-uapa-sky">
            {FERIA.school.toUpperCase()}
          </div>
          <div className="font-display text-sm font-bold text-white">
            UAPAverse · UAPA
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={startTour}
            className={`glass rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 ${
              tourActive ? "ring-1 ring-uapa-gold" : ""
            }`}
          >
            ▶ Tour guiado
          </button>
          <button
            onClick={toggleAudio}
            aria-label="Audio"
            className="glass rounded-2xl px-3.5 py-2.5 text-sm text-white transition hover:bg-white/15"
          >
            {audioOn ? "🔊" : "🔈"}
          </button>
        </div>
      </div>

      {/* ====== navegación rápida por carrera (lateral izquierda) ====== */}
      <div className="pointer-events-auto absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
        {CARRERA_STATIONS.map((c) => (
          <button
            key={c.uid}
            onClick={() => goToStand(c.index)}
            title={c.carreraName}
            className="group flex items-center gap-2"
          >
            <span
              className="h-3 w-3 rounded-full border border-white/40 transition group-hover:scale-125"
              style={{ background: c.color }}
            />
            <span className="glass rounded-lg px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              {c.carreraShort}
            </span>
          </button>
        ))}
      </div>

      {/* ====== crosshair ====== */}
      {!hideCenter && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`h-2 w-2 rounded-full border transition-all duration-200 ${
              nearby
                ? "scale-150 border-uapa-gold bg-uapa-gold/40"
                : "border-white/50 bg-white/10"
            }`}
          />
        </div>
      )}

      {/* ====== prompt de stand cercano ====== */}
      <AnimatePresence>
        {nearby && !hideCenter && (
          <motion.button
            key={nearby.uid}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={() => openStation(nearby)}
            className="pointer-events-auto absolute bottom-28 left-1/2 z-30 -translate-x-1/2 sm:bottom-24"
          >
            <div
              className="glass-strong flex items-center gap-3 rounded-2xl px-5 py-3"
              style={{ borderColor: `${nearby.color}66` }}
            >
              <span
                className="hidden h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white sm:flex"
                style={{ background: nearby.color }}
              >
                E
              </span>
              <div className="text-left">
                <div
                  className="text-[10px] font-bold tracking-wider"
                  style={{ color: nearby.accent }}
                >
                  {nearby.kind === "carrera" ? "CARRERA" : "PROYECTO"}
                </div>
                <div className="text-sm font-semibold text-white">
                  Abrir · {nearby.title}
                </div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
