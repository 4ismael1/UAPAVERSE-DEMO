import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, AdaptiveDpr, BakeShadows } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
} from "@react-three/postprocessing";
import * as THREE from "three";
import Pavilion from "./Pavilion";
import Stand from "./Stand";
import Player from "./Player";
import { STATIONS, HALL_LENGTH } from "../data/feria";

const FRONT_Z = 10;
const BACK_Z = FRONT_Z - HALL_LENGTH;
const CENTER_Z = (FRONT_Z + BACK_Z) / 2;

export default function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
      camera={{ fov: 70, near: 0.1, far: 200, position: [0, 1.65, 7] }}
    >
      <color attach="background" args={["#080f20"]} />
      <fog attach="fog" args={["#080f20", 24, 82]} />

      {/* iluminación general */}
      <hemisphereLight args={["#aecaff", "#121a30", 0.6]} />
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={0.62}
        color="#dbe7ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-8, 9, -6]} intensity={0.3} color="#9fc0ff" />

      <Suspense fallback={null}>
        <Pavilion />
        {STATIONS.map((s) => (
          <Stand key={s.uid} station={s} />
        ))}

        <Sparkles
          count={70}
          scale={[12, 5, HALL_LENGTH]}
          position={[0, 3, CENTER_Z]}
          size={2}
          speed={0.25}
          opacity={0.4}
          color="#9fc0ff"
        />
        <BakeShadows />
      </Suspense>

      <Player />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.65}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.35} darkness={0.5} />
        <SMAA />
      </EffectComposer>

      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
