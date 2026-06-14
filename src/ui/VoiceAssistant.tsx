import { motion } from "framer-motion";
import { useVoiceAssistant, type VoiceState } from "../ai/useVoiceAssistant";

const LABELS: Record<VoiceState, string> = {
  idle: "Mantén pulsado para preguntar",
  recording: "Escuchando…",
  processing: "Pensando…",
  speaking: "Respondiendo…",
  error: "Ocurrió un problema",
};

export default function VoiceAssistant({
  context,
  color,
  accent,
}: {
  context: string;
  color: string;
  accent: string;
}) {
  const va = useVoiceAssistant(context);
  const { state, level, answer, error } = va;

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    if (state === "speaking") va.stopSpeaking();
    if (state === "processing") return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    va.startRecording();
  };
  const up = (e: React.PointerEvent) => {
    e.preventDefault();
    if (state === "recording") va.stopRecording();
  };

  const recording = state === "recording";
  const speaking = state === "speaking";
  const processing = state === "processing";

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: `${color}55`,
        background: `linear-gradient(160deg, ${color}1f, rgba(8,13,28,0.5))`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* orbe / robot */}
        <div className="relative h-16 w-16 shrink-0">
          {(recording || speaking) && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: recording ? "#ef4444" : accent }}
              animate={{
                scale: recording ? 1 + level * 0.8 : [1, 1.35, 1],
                opacity: recording ? 0.35 + level * 0.3 : [0.3, 0, 0.3],
              }}
              transition={
                recording
                  ? { duration: 0.08 }
                  : { duration: 1.4, repeat: Infinity }
              }
            />
          )}
          <motion.div
            className="absolute inset-1 flex items-center justify-center rounded-full text-2xl"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${accent}, ${color})`,
              boxShadow: `0 0 24px ${color}aa`,
            }}
            animate={{ scale: recording ? 1 + level * 0.25 : 1 }}
            transition={{ duration: 0.08 }}
          >
            <motion.span
              animate={
                processing
                  ? { rotate: 360 }
                  : speaking
                  ? { y: [0, -2, 0] }
                  : {}
              }
              transition={
                processing
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : { duration: 0.5, repeat: Infinity }
              }
            >
              {processing ? "◌" : speaking ? "🔊" : "🤖"}
            </motion.span>
          </motion.div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest" style={{ color: accent }}>
              ARI · ASISTENTE IA
            </span>
            {recording && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                REC
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-white">{LABELS[state]}</div>

          {/* medidor de nivel de audio */}
          {recording && (
            <div className="mt-1.5 flex h-4 items-end gap-0.5">
              {Array.from({ length: 18 }).map((_, i) => {
                const active = level * 18 > i;
                return (
                  <span
                    key={i}
                    className="w-1 rounded-sm transition-all"
                    style={{
                      height: active ? `${6 + (i % 5) * 2 + level * 8}px` : "3px",
                      background: active ? "#ef4444" : "rgba(255,255,255,0.18)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* botón mantener pulsado */}
        <button
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          onContextMenu={(e) => e.preventDefault()}
          disabled={processing}
          className="relative flex h-16 w-16 shrink-0 select-none items-center justify-center rounded-full text-2xl text-white transition active:scale-95 disabled:opacity-50"
          style={{
            background: recording
              ? "linear-gradient(160deg,#ef4444,#b91c1c)"
              : `linear-gradient(160deg, ${color}, ${color}cc)`,
            boxShadow: recording
              ? "0 0 26px rgba(239,68,68,0.7)"
              : `0 0 20px ${color}88`,
            touchAction: "none",
          }}
          title="Mantén pulsado para hablar"
        >
          {recording ? "●" : "🎤"}
        </button>
      </div>

      {/* respuesta */}
      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl bg-white/[0.06] p-3 text-sm leading-relaxed text-slate-100"
        >
          {answer}
          {speaking && (
            <button
              onClick={va.stopSpeaking}
              className="ml-2 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/80 hover:bg-white/20"
            >
              ⏹ Detener
            </button>
          )}
        </motion.div>
      )}

      {/* error / aviso */}
      {state === "error" && error && (
        <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-200">
          {error}
        </div>
      )}

      <p className="mt-2 text-[11px] text-slate-400">
        Pregunta por voz sobre este stand y ARI te responde hablando.
      </p>
    </div>
  );
}
