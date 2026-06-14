import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen() {
  const { active, progress } = useProgress();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-uapa-dark"
        >
          <div className="w-64 max-w-[80vw]">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-display text-sm font-bold text-white">
                Preparando la feria
              </span>
              <span className="text-sm font-semibold text-uapa-sky">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-uapa-sky to-uapa-gold"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 h-3 w-2/3 overflow-hidden rounded shimmer" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
