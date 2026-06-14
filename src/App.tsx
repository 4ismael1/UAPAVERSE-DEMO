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
  useAmbientAudio();

  return (
    <div className="relative h-full w-full overflow-hidden bg-uapa-dark">
      {phase === "running" && (
        <>
          <Experience />
          <LoadingScreen />
          <Hud />
          <Minimap />
          <Joystick />
          <TourControls />
          <StationModal />
          <WelcomeOverlay />
        </>
      )}

      <AnimatePresence>{phase === "intro" && <Intro />}</AnimatePresence>
    </div>
  );
}
