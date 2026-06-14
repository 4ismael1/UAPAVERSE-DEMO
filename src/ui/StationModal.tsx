import { AnimatePresence, motion } from "framer-motion";
import { useFeria } from "../store";
import type { MediaImage } from "../data/feria";
import VoiceAssistant from "./VoiceAssistant";
import { buildStationContext } from "../ai/context";

function ImageCard({
  img,
  color,
  accent,
}: {
  img: MediaImage;
  color: string;
  accent: string;
}) {
  if (img.src) {
    return (
      <img
        src={img.src}
        alt={img.label}
        className="h-28 w-full rounded-xl object-cover"
      />
    );
  }
  return (
    <div
      className="relative flex h-28 items-end overflow-hidden rounded-xl p-3"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
      }}
    >
      <div
        className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{ background: "rgba(0,0,0,.35)", color: accent }}
      >
        DEMO
      </div>
      <span className="text-xs font-semibold text-white drop-shadow">
        {img.label}
      </span>
    </div>
  );
}

export default function StationModal() {
  const station = useFeria((s) => s.activeStation);
  const close = useFeria((s) => s.closeStation);

  return (
    <AnimatePresence>
      {station && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            className="glass-strong relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl"
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: `${station.color}55` }}
          >
            {/* cabecera */}
            <div
              className="flex items-start justify-between gap-4 px-6 py-4"
              style={{
                background: `linear-gradient(90deg, ${station.color}33, transparent)`,
              }}
            >
              <div>
                <div
                  className="text-xs font-bold tracking-widest"
                  style={{ color: station.accent }}
                >
                  {station.kind === "carrera"
                    ? "STAND DE CARRERA"
                    : station.carreraName.toUpperCase()}
                </div>
                <h2 className="font-display text-2xl font-extrabold text-white">
                  {station.title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-300">
                  {station.subtitle}
                </p>
              </div>
              <button
                onClick={close}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/15"
              >
                Cerrar ✕
              </button>
            </div>

            {/* cuerpo scrollable */}
            <div className="scrollbar-thin grid gap-5 overflow-y-auto px-6 py-5 md:grid-cols-2">
              {/* columna media */}
              <div className="space-y-4">
                {(station.kind === "carrera"
                  ? station.carrera!.careerVideoId
                  : station.project!.youtubeId) && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`https://www.youtube.com/embed/${
                          station.kind === "carrera"
                            ? station.carrera!.careerVideoId
                            : station.project!.youtubeId
                        }?rel=0`}
                        title={station.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {(station.kind === "carrera"
                    ? station.carrera!.images
                    : station.project!.images
                  ).map((img, i) => (
                    <ImageCard
                      key={i}
                      img={img}
                      color={station.color}
                      accent={station.accent}
                    />
                  ))}
                </div>
              </div>

              {/* columna info */}
              <div className="space-y-4">
                <VoiceAssistant
                  context={buildStationContext(station)}
                  color={station.color}
                  accent={station.accent}
                />
                {station.kind === "carrera" ? (
                  <>
                    <p className="text-sm leading-relaxed text-slate-200">
                      {station.carrera!.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(station.carrera!.stats).map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div className="text-[10px] uppercase tracking-wider text-slate-400">
                            {k}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3
                        className="mb-2 text-sm font-bold"
                        style={{ color: station.accent }}
                      >
                        ¿Qué ofrece la UAPA?
                      </h3>
                      <ul className="space-y-1.5">
                        {station.carrera!.offer.map((o, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-slate-200"
                          >
                            <span style={{ color: station.color }}>▸</span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3
                        className="mb-2 text-sm font-bold"
                        style={{ color: station.accent }}
                      >
                        Pensum{" "}
                        <span className="font-normal text-slate-400">
                          (representativo)
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {station.carrera!.pensum.map((t, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div className="mb-1 text-xs font-semibold text-white">
                              {t.term}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {t.subjects.map((s, j) => (
                                <span
                                  key={j}
                                  className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {station.project!.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                          style={{
                            background: `${station.color}22`,
                            color: station.accent,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200">
                      {station.project!.description}
                    </p>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Equipo
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {station.project!.authors.join(" · ")}
                      </div>
                    </div>
                    {station.project!.links?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {station.project!.links.map((l) => (
                          <a
                            key={l.url}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 transition hover:bg-white/15"
                          >
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
