import { useMemo } from "react";
import { Text, MeshReflectorMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  HALL_LENGTH,
  HALL_WIDTH,
  CARRERA_STATIONS,
  FERIA,
} from "../data/feria";

const FRONT_Z = 10;
const BACK_Z = FRONT_Z - HALL_LENGTH;
const CENTER_Z = (FRONT_Z + BACK_Z) / 2;
const HW = HALL_WIDTH / 2;
const CEIL = 6.2;

// Logo (PNG con letras blancas, fondo transparente) sobre la pared.
function LogoSign({
  src = "logo.png",
  position,
  rotation = [0, 0, 0],
  height = 1.6,
  maxWidth = Infinity,
}: {
  src?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
  maxWidth?: number;
}) {
  const tex = useTexture(`${import.meta.env.BASE_URL}${src}`);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const img = tex.image as { width: number; height: number } | undefined;
  const aspect = img && img.height ? img.width / img.height : 4;
  let h = height;
  let w = h * aspect;
  if (w > maxWidth) {
    w = maxWidth;
    h = w / aspect;
  }
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        alphaTest={0.02}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function CeilingLights() {
  const rows = useMemo(() => {
    const arr: number[] = [];
    for (let z = FRONT_Z - 4; z > BACK_Z + 2; z -= 6) arr.push(z);
    return arr;
  }, []);
  return (
    <group>
      {/* canal de luz central continuo */}
      <mesh position={[0, CEIL - 0.04, CENTER_Z]}>
        <boxGeometry args={[1.1, 0.06, HALL_LENGTH - 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#dbe8ff" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {rows.map((z, i) => (
        <group key={i}>
          {[-3.2, 3.2].map((x) => (
            <mesh key={x} position={[x, CEIL - 0.05, z]}>
              <boxGeometry args={[2.0, 0.08, 0.55]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#e6f0ff"
                emissiveIntensity={2.4}
                toneMapped={false}
              />
            </mesh>
          ))}
          <pointLight
            position={[0, CEIL - 0.4, z]}
            intensity={11}
            distance={17}
            decay={2}
            color="#e2ecff"
          />
        </group>
      ))}
    </group>
  );
}

function ZoneArch({
  z,
  color,
  accent,
  label,
}: {
  z: number;
  color: string;
  accent: string;
  label: string;
}) {
  return (
    <group position={[0, 0, z]}>
      {/* columnas */}
      {[-HW + 0.4, HW - 0.4].map((x) => (
        <mesh key={x} position={[x, CEIL / 2, 0]}>
          <boxGeometry args={[0.5, CEIL, 0.5]} />
          <meshStandardMaterial color="#0b1326" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {/* viga superior */}
      <mesh position={[0, CEIL - 0.5, 0]}>
        <boxGeometry args={[HALL_WIDTH - 0.4, 1.0, 0.5]} />
        <meshStandardMaterial color="#0a1124" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, CEIL - 0.5, 0.28]}>
        <boxGeometry args={[HALL_WIDTH - 0.6, 0.9, 0.04]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, CEIL - 0.5, 0.32]}
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineWidth={0.01}
        outlineColor={accent}
        maxWidth={HALL_WIDTH - 1.2}
        textAlign="center"
      >
        {label.toUpperCase()}
      </Text>
    </group>
  );
}

export default function Pavilion({
  highQuality = true,
}: {
  highQuality?: boolean;
}) {
  return (
    <group>
      {/* ===== SUELO ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, CENTER_Z]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        {highQuality ? (
          <MeshReflectorMaterial
            resolution={512}
            mirror={0.4}
            blur={[140, 50]}
            mixBlur={0.9}
            mixStrength={1.9}
            roughness={0.88}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#10182e"
            metalness={0.5}
          />
        ) : (
          // Modo rendimiento: suelo pulido sin reflejo (mucho más barato).
          <meshStandardMaterial color="#141d33" roughness={0.6} metalness={0.35} />
        )}
      </mesh>

      {/* línea central del pasillo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, CENTER_Z]}>
        <planeGeometry args={[1.4, HALL_LENGTH - 4]} />
        <meshStandardMaterial
          color="#1d6fd6"
          emissive="#1d6fd6"
          emissiveIntensity={0.35}
          toneMapped={false}
          transparent
          opacity={0.4}
          polygonOffset
          polygonOffsetFactor={-2}
          depthWrite={false}
        />
      </mesh>

      {/* ===== TECHO ===== */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, CENTER_Z]}>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <meshStandardMaterial color="#0c1426" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <CeilingLights />

      {/* ===== PAREDES laterales ===== */}
      {[-HW, HW].map((x) => (
        <group key={x}>
          <mesh position={[x, CEIL / 2, CENTER_Z]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <planeGeometry args={[HALL_LENGTH, CEIL]} />
            <meshStandardMaterial color="#141f38" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* cornisa de luz superior */}
          <mesh position={[x > 0 ? x - 0.1 : x + 0.1, CEIL - 0.4, CENTER_Z]}>
            <boxGeometry args={[0.1, 0.12, HALL_LENGTH - 4]} />
            <meshStandardMaterial color="#7ec8ff" emissive="#7ec8ff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ===== PARED del fondo ===== */}
      <mesh position={[0, CEIL / 2, BACK_Z]}>
        <planeGeometry args={[HALL_WIDTH, CEIL]} />
        <meshStandardMaterial color="#141f38" roughness={0.9} />
      </mesh>
      <group position={[0, 0, BACK_Z + 0.08]}>
        {/* nombre del proyecto */}
        <Text
          position={[0, 4.9, 0]}
          fontSize={0.78}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          outlineWidth={0.012}
          outlineColor="#1d6fd6"
          letterSpacing={0.02}
        >
          UAPAverse
        </Text>
        <Text
          position={[0, 4.25, 0]}
          fontSize={0.22}
          anchorX="center"
          anchorY="middle"
          color="#7ec8ff"
          letterSpacing={0.22}
        >
          NOMBRE DEL PROYECTO
        </Text>

        {/* logos: UAPA y CadeSoft */}
        <LogoSign src="logo.png" position={[-3.6, 2.7, 0]} height={1.7} maxWidth={6} />
        <LogoSign src="cadesoft.png" position={[3.6, 2.7, 0]} height={1.7} maxWidth={6} />
      </group>

      {/* ===== ENTRADA (pared frontal con título) ===== */}
      <mesh position={[0, CEIL / 2, FRONT_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[HALL_WIDTH, CEIL]} />
        <meshStandardMaterial color="#141f38" roughness={0.9} />
      </mesh>
      <group position={[0, 0, FRONT_Z - 0.12]}>
        <LogoSign
          position={[0, 4.2, 0]}
          rotation={[0, Math.PI, 0]}
          height={1.9}
          maxWidth={HALL_WIDTH - 2}
        />
        <Text
          position={[0, 3.0, 0]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.32}
          anchorX="center"
          anchorY="middle"
          color="#7ec8ff"
          letterSpacing={0.08}
        >
          {FERIA.school.toUpperCase()}  ·  {FERIA.edition.toUpperCase()}
        </Text>
      </group>

      {/* ===== Arcos de zona por carrera ===== */}
      {CARRERA_STATIONS.map((s) => (
        <ZoneArch
          key={s.uid}
          z={s.position[2] + 4.2}
          color={s.color}
          accent={s.accent}
          label={s.carreraName}
        />
      ))}

      {/* alfombra de entrada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, FRONT_Z - 4]}>
        <planeGeometry args={[5, 6]} />
        <meshStandardMaterial
          color="#0e2548"
          emissive="#1d6fd6"
          emissiveIntensity={0.12}
          polygonOffset
          polygonOffsetFactor={-1}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
