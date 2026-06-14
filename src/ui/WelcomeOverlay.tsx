import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FERIA } from "../data/feria";

const TITLE = "UAPAverse";

/**
 * Secuencia cinemática "Bienvenido a UAPAverse" que aparece al entrar a la
 * feria. Se reproduce SOLA (sin la escena 3D montada) para que no se trabe;
 * al terminar llama a `onFinish`, momento en el que se monta la escena.
 */
export default function WelcomeOverlay({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 4400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {visible && (
        <motion.div
          className="absolute inset-0 z-[60] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          onClick={() => setVisible(false)}
        >
          {/* fondo cinemático */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#0c2c5e_0%,#081633_45%,#04060d_80%)]" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-uapa-sky/25 blur-[140px]"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          />

          <div className="relative z-10 px-6 text-center">
            <motion.p
              initial={{ y: 16, opacity: 0, letterSpacing: "0.2em" }}
              animate={{ y: 0, opacity: 1, letterSpacing: "0.5em" }}
              transition={{ delay: 0.3, duration: 1 }}
              className="mb-4 text-sm font-semibold uppercase tracking-[0.5em] text-uapa-sky"
            >
              Bienvenido a
            </motion.p>

            <h1 className="flex flex-nowrap items-end justify-center whitespace-nowrap font-display text-5xl font-extrabold leading-none text-white sm:text-8xl">
              {TITLE.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    delay: 0.55 + i * 0.07,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  className="bg-gradient-to-r from-uapa-sky via-white to-uapa-gold bg-clip-text text-transparent"
                >
                  {ch}
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.9 }}
              className="mx-auto mt-6 h-px w-56 origin-center bg-gradient-to-r from-transparent via-white/70 to-transparent"
            />

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.9 }}
              className="mt-5 text-base font-medium text-slate-200 sm:text-lg"
            >
              Feria Virtual 3D · Ingeniería y Tecnología
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.9 }}
              className="mt-2 text-xs uppercase tracking-widest text-slate-400"
            >
              {FERIA.demoTag} · {FERIA.university}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 3.6, duration: 1 }}
              className="mt-10 text-[11px] text-slate-500"
            >
              Toca para continuar
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
