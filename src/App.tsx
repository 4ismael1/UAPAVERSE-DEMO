import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useFeria } from "./store";
import Experience from "./three/Experience";
import Intro from "./ui/Intro";
import Hud from "./ui/Hud";
import Minimap from "./ui/Minimap";
import Joystick from "./ui/Joystick";
import TourControls from "./ui/TourControls";
import StationModal from "./ui/StationModal";
import LoadingScreen from "./ui/LoadingScreen";
import WelcomeOverlay from "./ui/WelcomeOverlay";
import { useAmbientAudio } from "./ui/useAmbientAudio";

export default function App() {
  const phase = useFeria((s) => s.phase);
  // La escena 3D se monta SOLO cuando termina la animación de bienvenida,
  // así la intro no compite con la carga del Canvas y no se traba.
  const [sceneMounted, setSceneMounted] = useState(false);
  useAmbientAudio();

  return (
    <div className="relative h-full w-full overflow-hidden bg-uapa-dark">
      {phase === "running" && (
        <>
          {!sceneMounted && (
            <WelcomeOverlay onFinish={() => setSceneMounted(true)} />
          )}

          {sceneMounted && (
            <>
              <Experience />
              <LoadingScreen />
              <Hud />
              <Minimap />
              <Joystick />
              <TourControls />
              <StationModal />
            </>
          )}
        </>
      )}

      <AnimatePresence>{phase === "intro" && <Intro />}</AnimatePresence>
    </div>
  );
}
