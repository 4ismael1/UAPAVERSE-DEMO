import { useEffect, useMemo, useRef, useState } from "react";
import { Text, Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Station } from "../data/feria";
import { useFeria } from "../store";
import {
  makeImageTexture,
  makeVideoTexture,
  makeBannerTexture,
} from "./textures";

// ===================================================================
//  PANTALLA ENMARCADA  (bisel redondeado + retroiluminación + borde)
//  El plano de la pantalla queda en z=0 del grupo; todo lo demás
//  va detrás para evitar z-fighting.
// ===================================================================
function FramedScreen({
  texture,
  width,
  height,
  position,
  emissive = 0.7,
  accent,
  glow = true,
}: {
  texture: THREE.Texture;
  width: number;
  height: number;
  position: [number, number, number];
  emissive?: number;
  accent: string;
  glow?: boolean;
}) {
  return (
    <group position={position}>
      {glow && (
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[width + 0.55, height + 0.55]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      <RoundedBox
        args={[width + 0.24, height + 0.24, 0.1]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, -0.07]}
      >
        <meshStandardMaterial color="#0a1224" roughness={0.35} metalness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={emissive}
          toneMapped={false}
          roughness={0.3}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

// Carga la miniatura real de YouTube como textura (con fallback procedural)
function useThumbnail(
  videoId: string | undefined,
  fallback: THREE.Texture
): THREE.Texture {
  const [tex, setTex] = useState<THREE.Texture>(fallback);
  useEffect(() => {
    if (!videoId) {
      setTex(fallback);
      return;
    }
    let alive = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!alive) return;
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      setTex(t);
    };
    img.onerror = () => {
      if (alive) setTex(fallback);
    };
    img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);
  return tex;
}

// Botón de "play" sobre la miniatura
function PlayBadge({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          toneMapped={false}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh position={[0.04, 0, 0.01]} rotation={[0, 0, -Math.PI / 2]}>
        <circleGeometry args={[0.15, 3]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Pantalla de video con miniatura real + play + zona de clic
function VideoPanel({
  videoId,
  fallback,
  width,
  height,
  position,
  accent,
  onOpen,
  onHover,
}: {
  videoId?: string;
  fallback: THREE.Texture;
  width: number;
  height: number;
  position: [number, number, number];
  accent: string;
  onOpen: () => void;
  onHover: (v: boolean) => void;
}) {
  const tex = useThumbnail(videoId, fallback);
  const [x, y, z] = position;
  return (
    <group>
      <FramedScreen
        texture={tex}
        width={width}
        height={height}
        position={position}
        emissive={0.92}
        accent={accent}
      />
      <PlayBadge position={[x, y, z + 0.06]} accent={accent} />
      <mesh
        position={[x, y, z + 0.08]}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Emblema giratorio sobre la cabecera del stand
function Emblem({ color, accent }: { color: string; accent: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.8;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.16, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={accent}
        emissiveIntensity={0.9}
        metalness={0.6}
        roughness={0.25}
        toneMapped={false}
      />
    </mesh>
  );
}

// Marco de luz perimetral de la tarima
function PlatformTrim({
  w,
  d,
  y,
  matRef,
}: {
  w: number;
  d: number;
  y: number;
  matRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
  const t = 0.07;
  const bars: [number, number, number, number, number, boolean][] = [
    [0, y, d / 2, w, t, true],
    [0, y, -d / 2, w, t, false],
    [w / 2, y, 0, t, d, false],
    [-w / 2, y, 0, t, d, false],
  ];
  return (
    <>
      {bars.map(([px, py, pz, sx, sz, lead], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <boxGeometry args={[sx, 0.04, sz]} />
          {lead ? (
            <meshStandardMaterial ref={matRef} toneMapped={false} />
          ) : (
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.45}
              toneMapped={false}
            />
          )}
        </mesh>
      ))}
    </>
  );
}

export default function Stand({ station }: { station: Station }) {
  const openStation = useFeria((s) => s.openStation);
  const nearbyUid = useFeria((s) => s.nearbyStand?.uid);
  const [hovered, setHovered] = useState(false);
  const isNear = nearbyUid === station.uid;
  const active = hovered || isNear;

  const isCarrera = station.kind === "carrera";
  const W = isCarrera ? 8.6 : 7.0;
  const D = 4.6;
  const H = 3.6;
  const col = station.color;
  const accent = station.accent;

  const WALL_T = 0.25;
  const WALL_FRONT = -D / 2 + WALL_T / 2;
  const ZW = WALL_FRONT + 0.16; // plano frontal donde montamos pantallas

  const trimMat = useRef<THREE.MeshStandardMaterial | null>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (trimMat.current) {
      const c = new THREE.Color(accent);
      trimMat.current.color.copy(c);
      trimMat.current.emissive.copy(c);
      const pulse = active
        ? 1.0 + Math.sin(state.clock.elapsedTime * 3) * 0.3
        : 0.5;
      trimMat.current.emissiveIntensity +=
        (pulse - trimMat.current.emissiveIntensity) * 0.12;
    }
    if (light.current) {
      const tgt = active ? 1.5 : 0.85;
      light.current.intensity += (tgt - light.current.intensity) * 0.1;
    }
  });

  // ---- texturas ----
  const videoTex = useMemo(
    () =>
      makeVideoTexture(
        isCarrera ? `Conoce ${station.title}` : station.title,
        col,
        `vid-${station.uid}`
      ),
    [station.uid, station.title, col, isCarrera]
  );
  const bannerTex = useMemo(
    () =>
      isCarrera
        ? makeBannerTexture(station.carreraShort, col, accent, `ban-${station.uid}`)
        : null,
    [station.uid, station.carreraShort, col, accent, isCarrera]
  );
  const images = isCarrera ? station.carrera!.images : station.project!.images;
  const imgTex = useMemo(
    () =>
      images
        .slice(0, 2)
        .map((im, i) => makeImageTexture(im.label, col, accent, `img-${station.uid}-${i}`)),
    [images, col, accent, station.uid]
  );

  const open = () => openStation(station);
  const videoId = isCarrera
    ? station.carrera!.careerVideoId
    : station.project!.youtubeId;
  const pillarX = W / 2 - 0.16;
  const pillarZ = D / 2 - 0.16;

  return (
    <group position={station.position} rotation={[0, station.rotationY, 0]}>
      {/* ===== TARIMA ===== */}
      <RoundedBox
        args={[W + 0.5, 0.18, D + 0.5]}
        radius={0.06}
        smoothness={3}
        position={[0, 0.09, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#131f38" roughness={0.5} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.185, 0.25]} receiveShadow>
        <boxGeometry args={[W - 0.4, 0.02, D - 0.9]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.12} roughness={0.85} />
      </mesh>
      <PlatformTrim w={W + 0.5} d={D + 0.5} y={0.2} matRef={trimMat} />

      {/* ===== PARED TRASERA (con paneles) ===== */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W, H, WALL_T]} />
        <meshStandardMaterial color="#1b2a4d" roughness={0.8} metalness={0.12} />
      </mesh>
      {/* panel central rebajado */}
      <RoundedBox
        args={[W - 0.6, H - 0.5, 0.06]}
        radius={0.05}
        smoothness={3}
        position={[0, H / 2, WALL_FRONT + 0.04]}
      >
        <meshStandardMaterial color="#22365f" roughness={0.75} metalness={0.15} />
      </RoundedBox>
      {/* franjas verticales de acento en los bordes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (W - 0.5)) / 2, H / 2, WALL_FRONT + 0.09]}>
          <planeGeometry args={[0.06, H - 0.7]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}

      {/* ===== PAREDES LATERALES ===== */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * W) / 2, H / 2, 0]} receiveShadow>
          <boxGeometry args={[0.16, H, D]} />
          <meshStandardMaterial color="#163055" roughness={0.8} metalness={0.1} />
        </mesh>
      ))}

      {/* ===== PILARES FRONTALES ===== */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * pillarX, 0, pillarZ]}>
          <mesh position={[0, H / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, H, 20]} />
            <meshStandardMaterial color="#0a1326" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, H / 2, 0]}>
            <cylinderGeometry args={[0.085, 0.085, H - 0.6, 20]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ===== FASCIA / CABECERA ===== */}
      <RoundedBox
        args={[W + 0.1, 0.66, 0.34]}
        radius={0.08}
        smoothness={3}
        position={[0, H + 0.08, pillarZ]}
        castShadow
      >
        <meshStandardMaterial color="#0a1226" roughness={0.5} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, H - 0.16, pillarZ + 0.21]}>
        <planeGeometry args={[W + 0.1, 0.05]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <Text
        position={[0, H + 0.12, pillarZ + 0.21]}
        fontSize={isCarrera ? 0.34 : 0.3}
        maxWidth={W - 0.6}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineWidth={0.006}
        outlineColor="#05070f"
      >
        {station.title}
      </Text>
      <Text
        position={[0, H + 0.46, pillarZ + 0.21]}
        fontSize={0.12}
        anchorX="center"
        anchorY="middle"
        color={accent}
        letterSpacing={0.14}
      >
        {station.carreraName.toUpperCase()}
      </Text>

      {/* emblema giratorio */}
      <group position={[0, H + 0.6, pillarZ]}>
        <Float speed={2} floatIntensity={0.4} rotationIntensity={0}>
          <Emblem color={col} accent={accent} />
        </Float>
      </group>

      {/* luz de acento del stand */}
      <pointLight
        ref={light}
        position={[0, H - 0.5, 0.6]}
        color={col}
        intensity={0.85}
        distance={11}
        decay={2}
      />
      <pointLight position={[0, 1.6, D / 2 - 0.2]} color="#ffffff" intensity={0.35} distance={6} decay={2} />

      {/* ===================== CONTENIDO ===================== */}
      {isCarrera ? (
        <>
          {/* banner superior */}
          {bannerTex && (
            <FramedScreen
              texture={bannerTex}
              width={W - 1.6}
              height={0.5}
              position={[0, H - 0.4, ZW]}
              emissive={0.8}
              accent={accent}
              glow={false}
            />
          )}

          {/* video (izquierda) con miniatura real */}
          <VideoPanel
            videoId={videoId}
            fallback={videoTex}
            width={3.0}
            height={1.7}
            position={[-W / 4 - 0.1, 1.6, ZW]}
            accent={accent}
            onOpen={open}
            onHover={setHovered}
          />

          {/* pensum (derecha) */}
          <group position={[W / 4 + 0.2, 1.55, ZW]}>
            <RoundedBox args={[3.6, 2.0, 0.08]} radius={0.07} smoothness={3}>
              <meshStandardMaterial color="#16223f" roughness={0.6} metalness={0.2} />
            </RoundedBox>
            <mesh position={[0, 0.8, 0.05]}>
              <planeGeometry args={[3.6, 0.44]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} toneMapped={false} />
            </mesh>
            <Text position={[0, 0.8, 0.07]} fontSize={0.2} anchorX="center" anchorY="middle" color="#ffffff" letterSpacing={0.06}>
              PENSUM
            </Text>
            <Text
              position={[-1.6, 0.5, 0.06]}
              fontSize={0.125}
              maxWidth={3.2}
              lineHeight={1.5}
              anchorX="left"
              anchorY="top"
              color="#eef3ff"
            >
              {station
                .carrera!.pensum.map((t) => `${t.term}\n· ${t.subjects.join("\n· ")}`)
                .join("\n\n")}
            </Text>
          </group>

          {/* atril con descripción */}
          <group position={[0, 0, D / 2 - 1.2]}>
            <RoundedBox args={[0.55, 1.0, 0.55]} radius={0.05} smoothness={3} position={[0, 0.5, 0]}>
              <meshStandardMaterial color="#16223f" roughness={0.5} metalness={0.3} />
            </RoundedBox>
            <RoundedBox args={[2.7, 1.2, 0.08]} radius={0.04} smoothness={3} position={[0, 1.08, 0.04]} rotation={[-0.5, 0, 0]}>
              <meshStandardMaterial color="#1a2848" roughness={0.55} metalness={0.2} />
            </RoundedBox>
            <Text
              position={[0, 1.2, 0.26]}
              rotation={[-0.5, 0, 0]}
              fontSize={0.11}
              maxWidth={2.4}
              lineHeight={1.4}
              anchorX="center"
              anchorY="middle"
              color="#eef3ff"
            >
              {station.carrera!.description}
            </Text>
          </group>

          {/* imagen en pared lateral */}
          {imgTex[0] && (
            <group position={[W / 2 - 0.12, 1.7, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
              <FramedScreen
                texture={imgTex[0]}
                width={2.0}
                height={1.25}
                position={[0, 0, 0]}
                emissive={0.6}
                accent={accent}
              />
            </group>
          )}
        </>
      ) : (
        <>
          {/* banda de cabecera con resumen */}
          <group position={[0, H - 0.4, ZW]}>
            <RoundedBox args={[W - 1.2, 0.62, 0.08]} radius={0.08} smoothness={3}>
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.28} roughness={0.5} metalness={0.2} />
            </RoundedBox>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.16}
              maxWidth={W - 1.8}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              color="#ffffff"
            >
              {station.project!.summary}
            </Text>
          </group>

          {/* video con miniatura real */}
          <VideoPanel
            videoId={videoId}
            fallback={videoTex}
            width={3.0}
            height={1.7}
            position={[-W / 4 - 0.1, 1.95, ZW]}
            accent={accent}
            onOpen={open}
            onHover={setHovered}
          />

          {/* descripción bajo el video */}
          <group position={[-W / 4 - 0.1, 0.62, ZW]}>
            <RoundedBox args={[3.0, 0.95, 0.07]} radius={0.06} smoothness={3}>
              <meshStandardMaterial color="#16223f" roughness={0.6} metalness={0.2} />
            </RoundedBox>
            <Text
              position={[-1.35, 0.34, 0.05]}
              fontSize={0.1}
              maxWidth={2.7}
              lineHeight={1.4}
              anchorX="left"
              anchorY="top"
              color="#dfe7f7"
            >
              {station.project!.description.slice(0, 230) + "…"}
            </Text>
          </group>

          {/* imágenes (derecha) */}
          {imgTex[0] && (
            <FramedScreen
              texture={imgTex[0]}
              width={2.4}
              height={1.2}
              position={[W / 4 + 0.25, 2.2, ZW]}
              emissive={0.6}
              accent={accent}
            />
          )}
          {imgTex[1] && (
            <FramedScreen
              texture={imgTex[1]}
              width={2.4}
              height={1.2}
              position={[W / 4 + 0.25, 0.85, ZW]}
              emissive={0.6}
              accent={accent}
            />
          )}

          {/* mostrador */}
          <group position={[0, 0, D / 2 - 0.95]}>
            <RoundedBox args={[W - 2.4, 1.1, 0.62]} radius={0.06} smoothness={3} position={[0, 0.55, 0]} castShadow>
              <meshStandardMaterial color="#16223f" roughness={0.45} metalness={0.4} />
            </RoundedBox>
            <mesh position={[0, 0.55, 0.33]}>
              <planeGeometry args={[W - 3.2, 0.55]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} toneMapped={false} />
            </mesh>
            <mesh position={[0, 1.12, 0]}>
              <boxGeometry args={[W - 2.2, 0.05, 0.72]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
            </mesh>
          </group>
        </>
      )}

      {/* zona de interacción general */}
      <mesh
        position={[0, 1.4, D / 2 + 0.12]}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[W, 2.8, 1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

    </group>
  );
}
