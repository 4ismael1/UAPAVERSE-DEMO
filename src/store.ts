import { create } from "zustand";
import type { Station } from "./data/feria";

export type Phase = "intro" | "running";
export type Quality = "alto" | "rendimiento";

interface MoveState {
  forward: number; // -1..1
  strafe: number; // -1..1
}

interface FeriaState {
  phase: Phase;
  enter: () => void;

  // Estación abierta en el panel de detalle (modal 2D)
  activeStation: Station | null;
  openStation: (p: Station) => void;
  closeStation: () => void;

  // Stand más cercano (para mostrar el prompt "pulsa E / toca")
  nearbyStand: Station | null;
  setNearbyStand: (s: Station | null) => void;

  // Audio ambiente
  audioOn: boolean;
  toggleAudio: () => void;
  volume: number; // 0..1
  setVolume: (v: number) => void;

  // Calidad de gráficos
  quality: Quality;
  setQuality: (q: Quality) => void;
  toggleQuality: () => void;

  // Tour guiado
  tourActive: boolean;
  tourIndex: number;
  startTour: () => void;
  stopTour: () => void;
  nextTour: () => void;
  prevTour: () => void;
  goToStand: (index: number) => void;

  // Entrada de movimiento desde joystick táctil
  joystick: MoveState;
  setJoystick: (m: MoveState) => void;

  // Petición de teletransporte (la consume el Player)
  teleportTo: number | null;
  consumeTeleport: () => void;

  totalStands: number;
}

export const useFeria = create<FeriaState>((set, get) => ({
  phase: "intro",
  // Al entrar arrancamos la música (el clic cuenta como gesto del usuario,
  // requisito de los navegadores para reproducir audio).
  enter: () => set({ phase: "running", audioOn: true }),

  activeStation: null,
  openStation: (p) => set({ activeStation: p }),
  closeStation: () => set({ activeStation: null }),

  nearbyStand: null,
  setNearbyStand: (s) => {
    if (get().nearbyStand?.uid !== s?.uid) set({ nearbyStand: s });
  },

  audioOn: false,
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  volume: 0.22,
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),

  quality: "alto",
  setQuality: (q) => set({ quality: q }),
  toggleQuality: () =>
    set((s) => ({ quality: s.quality === "alto" ? "rendimiento" : "alto" })),

  tourActive: false,
  tourIndex: 0,
  startTour: () => set({ tourActive: true, tourIndex: 0, teleportTo: 0 }),
  stopTour: () => set({ tourActive: false }),
  nextTour: () =>
    set((s) => {
      const idx = Math.min(s.tourIndex + 1, s.totalStands - 1);
      return { tourIndex: idx, teleportTo: idx };
    }),
  prevTour: () =>
    set((s) => {
      const idx = Math.max(s.tourIndex - 1, 0);
      return { tourIndex: idx, teleportTo: idx };
    }),
  goToStand: (index) => set({ teleportTo: index, tourIndex: index }),

  joystick: { forward: 0, strafe: 0 },
  setJoystick: (m) => set({ joystick: m }),

  teleportTo: null,
  consumeTeleport: () => set({ teleportTo: null }),

  totalStands: 0,
}));
