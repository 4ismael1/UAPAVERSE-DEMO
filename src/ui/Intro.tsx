import { motion } from "framer-motion";
import { useFeria } from "../store";
import { FERIA, CARRERAS } from "../data/feria";

export default function Intro() {
  const enter = useFeria((s) => s.enter);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#123a73_0%,#0a1a3a_40%,#05070f_75%)]" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,170,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(125,170,255,.5) 1px,transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%,#000 30%,transparent 75%)",
        }}
      />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-uapa-sky/20 blur-[120px]" />
      <div className="absolute bottom-0 right-10 h-[360px] w-[360px] rounded-full bg-uapa-orange/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-uapa-sky"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-uapa-orange" />
          {FERIA.demoTag.toUpperCase()} · {FERIA.university.toUpperCase()}
        </motion.div>

        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-display text-5xl font-extrabold leading-[1.05] text-white sm:text-7xl"
        >
          <span className="bg-gradient-to-r from-uapa-sky via-white to-uapa-gold bg-clip-text text-transparent">
            UAPAverse
          </span>
          <span className="mt-3 block text-xl font-semibold text-slate-200 sm:text-2xl">
            Feria Virtual 3D · Ingeniería y Tecnología
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.7 }}
          className="mx-auto mt-5 max-w-xl text-balance text-sm leading-relaxed text-slate-300 sm:text-base"
        >
          Recorre un pabellón inmersivo con los stands de cada carrera: descubre
          de qué tratan, su pensum, videos, imágenes y los proyectos de los
          estudiantes. Camina, explora e interactúa como en una feria real.
        </motion.p>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.44, duration: 0.7 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
        >
          {CARRERAS.map((c) => (
            <span
              key={c.id}
              className="rounded-full border px-3 py-1 text-xs font-medium text-white/85"
              style={{
                borderColor: `${c.color}66`,
                background: `${c.color}1f`,
              }}
            >
              {c.short}
            </span>
          ))}
        </motion.div>

        <motion.button
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.56, duration: 0.7 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={enter}
          className="group mt-9 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-uapa-sky to-uapa-blue px-8 py-4 text-base font-bold text-white shadow-glow transition"
        >
          Entrar a la feria
          <span className="transition group-hover:translate-x-1">→</span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-6 text-xs text-slate-400"
        >
          En computadora: <b className="text-slate-200">WASD</b> para moverte ·{" "}
          <b className="text-slate-200">ratón</b> para mirar ·{" "}
          <b className="text-slate-200">E</b> para abrir un stand. En móvil: usa
          el joystick y arrastra para mirar.
        </motion.p>
      </div>
    </motion.div>
  );
}
