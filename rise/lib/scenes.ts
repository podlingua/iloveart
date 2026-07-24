export type SceneId =
  | "sunrise"
  | "rain"
  | "beach"
  | "space"
  | "cabin"
  | "fireplace"
  | "nature";

export type ParticleKind = "none" | "rain" | "stars" | "embers" | "motes" | "waves";

export interface SceneDef {
  id: SceneId;
  label: string;
  description: string;
  sky: [string, string, string, string]; // gradient stops, dawn -> zenith
  particles: ParticleKind;
  accent: string;
  tone: { baseFreq: number; noise?: "rain" | "crackle"; brightness: number };
}

export const SCENES: Record<SceneId, SceneDef> = {
  sunrise: {
    id: "sunrise",
    label: "Sunrise",
    description: "A slow golden dawn over the horizon.",
    sky: ["#0b1030", "#4a3a72", "#d9683a", "#ffd27a"],
    particles: "none",
    accent: "#ffb35c",
    tone: { baseFreq: 196, brightness: 0.7 },
  },
  rain: {
    id: "rain",
    label: "Rain",
    description: "Soft rain on a quiet window.",
    sky: ["#0d1420", "#1c2a3a", "#334a5e", "#4d6b80"],
    particles: "rain",
    accent: "#7fb3c9",
    tone: { baseFreq: 110, noise: "rain", brightness: 0.3 },
  },
  beach: {
    id: "beach",
    label: "Beach",
    description: "Warm tide, early light.",
    sky: ["#0e2a3f", "#1c5c78", "#3ea3a0", "#f5d98a"],
    particles: "waves",
    accent: "#6fd6c9",
    tone: { baseFreq: 165, brightness: 0.55 },
  },
  space: {
    id: "space",
    label: "Space",
    description: "Drifting quietly among the stars.",
    sky: ["#000000", "#0a0a1f", "#151033", "#2a1a4a"],
    particles: "stars",
    accent: "#8f7bff",
    tone: { baseFreq: 98, brightness: 0.2 },
  },
  cabin: {
    id: "cabin",
    label: "Cozy Cabin",
    description: "A warm window, snow outside.",
    sky: ["#1a1008", "#3a2416", "#6b4526", "#c98a4b"],
    particles: "motes",
    accent: "#e0a15c",
    tone: { baseFreq: 147, brightness: 0.45 },
  },
  fireplace: {
    id: "fireplace",
    label: "Fireplace",
    description: "Embers, low and glowing.",
    sky: ["#0a0503", "#210d05", "#4a1a08", "#8a3410"],
    particles: "embers",
    accent: "#ff7a3c",
    tone: { baseFreq: 130, noise: "crackle", brightness: 0.5 },
  },
  nature: {
    id: "nature",
    label: "Nature",
    description: "Light through the trees.",
    sky: ["#071a12", "#0f3324", "#1c5c3f", "#4c9464"],
    particles: "motes",
    accent: "#7fd99a",
    tone: { baseFreq: 175, brightness: 0.5 },
  },
};

export const SCENE_LIST = Object.values(SCENES);

export function skyGradient(scene: SceneDef): string {
  const [a, b, c, d] = scene.sky;
  return `linear-gradient(180deg, ${a} 0%, ${b} 38%, ${c} 70%, ${d} 100%)`;
}
