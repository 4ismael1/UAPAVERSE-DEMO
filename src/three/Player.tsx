import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFeria } from "../store";
import { playerState } from "./playerState";
import {
  STATIONS,
  HALL_WIDTH,
  HALL_LENGTH,
  AISLE_HALF_WIDTH,
} from "../data/feria";

const EYE = 1.65;
const SPEED = 5.2;
const ACCEL = 9;
const LOOK_SENS = 0.0022;
const TOUCH_SENS = 0.005;

const FRONT_Z = 10;
const BACK_Z = FRONT_Z - HALL_LENGTH;
const X_LIMIT = AISLE_HALF_WIDTH - 0.4;

export default function Player() {
  const { camera, gl } = useThree();

  const yaw = useRef(0); // mirando hacia -Z (hacia el fondo del recinto / los stands)
  const pitch = useRef(0);
  const pos = useRef(new THREE.Vector3(0, EYE, FRONT_Z - 3));
  const vel = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const bob = useRef(0);

  const touchLook = useRef<{ id: number | null; x: number; y: number }>({
    id: null,
    x: 0,
    y: 0,
  });

  const teleportTo = useFeria((s) => s.teleportTo);
  const consumeTeleport = useFeria((s) => s.consumeTeleport);
  const tourActive = useFeria((s) => s.tourActive);

  // objetivo de teletransporte/tour
  const target = useRef<{
    pos: THREE.Vector3;
    yaw: number;
    active: boolean;
  }>({ pos: new THREE.Vector3(), yaw: 0, active: false });

  useEffect(() => {
    camera.rotation.order = "YXZ";

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "KeyE") {
        const near = useFeria.getState().nearbyStand;
        if (near) useFeria.getState().openStation(near);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const canvas = gl.domElement;
    const requestLock = () => {
      if (useFeria.getState().activeStation) return;
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yaw.current -= e.movementX * LOOK_SENS;
      pitch.current -= e.movementY * LOOK_SENS;
      pitch.current = THREE.MathUtils.clamp(pitch.current, -1.2, 1.2);
    };

    // mirar con el dedo (móvil)
    const onTouchStart = (e: TouchEvent) => {
      if (touchLook.current.id !== null) return;
      const t = e.changedTouches[0];
      touchLook.current = { id: t.identifier, x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchLook.current.id) {
          const dx = t.clientX - touchLook.current.x;
          const dy = t.clientY - touchLook.current.y;
          yaw.current -= dx * TOUCH_SENS;
          pitch.current -= dy * TOUCH_SENS;
          pitch.current = THREE.MathUtils.clamp(pitch.current, -1.0, 1.0);
          touchLook.current.x = t.clientX;
          touchLook.current.y = t.clientY;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchLook.current.id)
          touchLook.current.id = null;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", requestLock);
    document.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("click", requestLock);
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [camera, gl]);

  // procesar teletransporte
  useEffect(() => {
    if (teleportTo === null) return;
    const st = STATIONS[teleportTo];
    if (!st) {
      consumeTeleport();
      return;
    }
    const [sx, , sz] = st.position;
    // colocarse en el pasillo frente al stand
    const standX = st.side * (AISLE_HALF_WIDTH - 2.0);
    const tp = new THREE.Vector3(standX, EYE, sz + 0.2);
    // mirar hacia el stand (hacia su X)
    const tyaw = st.side === -1 ? -Math.PI / 2 : Math.PI / 2;
    target.current = { pos: tp, yaw: tyaw, active: true };
    void sx;
    consumeTeleport();
  }, [teleportTo, consumeTeleport]);

  useFrame((_, dRaw) => {
    const dt = Math.min(dRaw, 0.05);

    // ---- modo tour / teletransporte: interpolar hacia el objetivo ----
    if (target.current.active) {
      pos.current.lerp(target.current.pos, 1 - Math.pow(0.001, dt));
      // interpolar yaw por el camino más corto
      let dy = target.current.yaw - yaw.current;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      yaw.current += dy * (1 - Math.pow(0.001, dt));
      pitch.current += (0 - pitch.current) * (1 - Math.pow(0.001, dt));
      if (
        pos.current.distanceTo(target.current.pos) < 0.05 &&
        Math.abs(dy) < 0.02
      ) {
        target.current.active = false;
      }
    } else {
      // ---- entrada de movimiento manual ----
      const k = keys.current;
      const joy = useFeria.getState().joystick;
      const locked =
        document.pointerLockElement === gl.domElement ||
        touchLook.current.id !== null ||
        joy.forward !== 0 ||
        joy.strafe !== 0;

      let f =
        (k["KeyW"] || k["ArrowUp"] ? 1 : 0) -
        (k["KeyS"] || k["ArrowDown"] ? 1 : 0);
      let s =
        (k["KeyD"] || k["ArrowRight"] ? 1 : 0) -
        (k["KeyA"] || k["ArrowLeft"] ? 1 : 0);
      f += joy.forward;
      s += joy.strafe;
      f = THREE.MathUtils.clamp(f, -1, 1);
      s = THREE.MathUtils.clamp(s, -1, 1);

      const sinY = Math.sin(yaw.current);
      const cosY = Math.cos(yaw.current);
      // forward en el plano XZ (cámara mira a -Z con yaw=0)
      const dirX = -sinY * f + cosY * s;
      const dirZ = -cosY * f - sinY * s;

      const desired = new THREE.Vector3(dirX, 0, dirZ);
      if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(SPEED);

      vel.current.x = THREE.MathUtils.damp(vel.current.x, desired.x, ACCEL, dt);
      vel.current.z = THREE.MathUtils.damp(vel.current.z, desired.z, ACCEL, dt);

      pos.current.x += vel.current.x * dt;
      pos.current.z += vel.current.z * dt;

      // límites del recinto
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -X_LIMIT, X_LIMIT);
      pos.current.z = THREE.MathUtils.clamp(
        pos.current.z,
        BACK_Z + 1.2,
        FRONT_Z - 1.2
      );

      // head bob
      const speed = Math.hypot(vel.current.x, vel.current.z);
      bob.current += dt * speed * 1.9;
      void locked;
    }

    // ---- detección de stand cercano ----
    let nearest: (typeof STATIONS)[number] | null = null;
    let nd = 4.2;
    for (const st of STATIONS) {
      const dx = st.position[0] - pos.current.x;
      const dz = st.position[2] - pos.current.z;
      const d = Math.hypot(dx, dz);
      if (d < nd) {
        nd = d;
        nearest = st;
      }
    }
    useFeria.getState().setNearbyStand(nearest);

    // ---- publicar posición para el minimapa ----
    playerState.x = pos.current.x;
    playerState.z = pos.current.z;
    playerState.yaw = yaw.current;

    // ---- aplicar a la cámara ----
    const bobY = Math.sin(bob.current) * 0.035;
    camera.position.set(
      pos.current.x,
      pos.current.y + bobY,
      pos.current.z
    );
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  // salir del pointer lock cuando hay un modal abierto
  const activeStation = useFeria((s) => s.activeStation);
  useEffect(() => {
    if (activeStation && document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, [activeStation]);

  void HALL_WIDTH;
  void tourActive;
  return null;
}
