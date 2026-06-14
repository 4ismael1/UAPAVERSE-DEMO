import { useEffect, useRef, useState } from "react";
import { useFeria } from "../store";

const SIZE = 120;
const R = SIZE / 2;
const KNOB = 46;
const MAX = R - KNOB / 2;

export default function Joystick() {
  const setJoystick = useFeria((s) => s.setJoystick);
  const baseRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  const update = (cx: number, cy: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const ox = rect.left + rect.width / 2;
    const oy = rect.top + rect.height / 2;
    let dx = cx - ox;
    let dy = cy - oy;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX) {
      dx = (dx / dist) * MAX;
      dy = (dy / dist) * MAX;
    }
    setKnob({ x: dx, y: dy });
    setJoystick({ forward: -dy / MAX, strafe: dx / MAX });
  };

  const reset = () => {
    touchId.current = null;
    setKnob({ x: 0, y: 0 });
    setJoystick({ forward: 0, strafe: 0 });
  };

  const onStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    update(t.clientX, t.clientY);
  };
  const onMove = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touchId.current) update(t.clientX, t.clientY);
    }
  };
  const onEnd = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touchId.current) reset();
    }
  };

  if (!isTouch) return null;

  return (
    <div
      ref={baseRef}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
      className="pointer-events-auto absolute bottom-6 left-6 z-30 touch-none select-none rounded-full"
      style={{
        width: SIZE,
        height: SIZE,
        background: "rgba(13,23,48,0.5)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(120,160,230,0.25)",
      }}
    >
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: KNOB,
          height: KNOB,
          left: R - KNOB / 2 + knob.x,
          top: R - KNOB / 2 + knob.y,
          background:
            "radial-gradient(circle at 35% 35%, #4d8ee0, #1d6fd6)",
          boxShadow: "0 4px 16px rgba(29,111,214,0.5)",
        }}
      />
    </div>
  );
}
