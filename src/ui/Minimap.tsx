import { useEffect, useRef, useState } from "react";
import { playerState } from "../three/playerState";
import { STATIONS, HALL_WIDTH, HALL_LENGTH } from "../data/feria";
import { useFeria } from "../store";

const FRONT_Z = 10;

const PAD = 8;
const W = 130;
const H = 200;

function mapX(x: number) {
  return PAD + ((x + HALL_WIDTH / 2) / HALL_WIDTH) * (W - PAD * 2);
}
function mapZ(z: number) {
  return PAD + ((FRONT_Z - z) / HALL_LENGTH) * (H - PAD * 2);
}

export default function Minimap() {
  const dotRef = useRef<SVGGElement>(null);
  const goToStand = useFeria((s) => s.goToStand);
  const nearbyUid = useFeria((s) => s.nearbyStand?.uid);
  const [, force] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (dotRef.current) {
        const px = mapX(playerState.x);
        const pz = mapZ(playerState.z);
        const deg = (-playerState.yaw * 180) / Math.PI + 180;
        dotRef.current.setAttribute(
          "transform",
          `translate(${px} ${pz}) rotate(${deg})`
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => force((n) => n + 1), [nearbyUid]);

  return (
    <div className="glass absolute bottom-3 right-3 z-30 hidden rounded-2xl p-2 sm:block">
      <svg width={W} height={H} className="block">
        <rect
          x={2}
          y={2}
          width={W - 4}
          height={H - 4}
          rx={12}
          fill="rgba(8,15,33,0.6)"
          stroke="rgba(120,160,230,0.25)"
        />
        {/* pasillo */}
        <line
          x1={W / 2}
          y1={PAD}
          x2={W / 2}
          y2={H - PAD}
          stroke="rgba(120,160,230,0.25)"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
        {STATIONS.map((s) => (
          <circle
            key={s.uid}
            cx={mapX(s.position[0])}
            cy={mapZ(s.position[2])}
            r={s.kind === "carrera" ? 4.5 : 3}
            fill={s.color}
            stroke={nearbyUid === s.uid ? "#fff" : "transparent"}
            strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onClick={() => goToStand(s.index)}
          />
        ))}
        {/* jugador */}
        <g ref={dotRef}>
          <polygon points="0,-6 4,5 -4,5" fill="#ffc24b" stroke="#fff" strokeWidth={0.8} />
        </g>
      </svg>
      <div className="px-1 pt-1 text-center text-[9px] text-slate-400">
        MAPA · toca un punto para ir
      </div>
    </div>
  );
}
