import { SceneDef, skyGradient } from "@/lib/scenes";
import { ParticleCanvas } from "@/components/scenes/ParticleCanvas";

interface SceneProps {
  scene: SceneDef;
  /** 0 = fully dark (pre-dawn), 1 = fully revealed. Only meaningful during the wake sequence. */
  brightness?: number;
  className?: string;
}

export function Scene({ scene, brightness = 1, className = "" }: SceneProps) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ background: skyGradient(scene) }}
    >
      {scene.id === "sunrise" && <SunGlow accent={scene.accent} />}
      {scene.id === "beach" && <Waves accent={scene.accent} />}
      <ParticleCanvas kind={scene.particles} accent={scene.accent} />
      <div
        className="absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: 1 - brightness }}
      />
    </div>
  );
}

function SunGlow({ accent }: { accent: string }) {
  return (
    <div
      className="absolute left-1/2 top-[62%] h-[40vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      style={{ background: accent, opacity: 0.55 }}
    />
  );
}

function Waves({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-1/3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-x-0 bottom-0 animate-pulse rounded-[100%]"
          style={{
            height: `${60 - i * 15}%`,
            background: accent,
            opacity: 0.08 + i * 0.04,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}
    </div>
  );
}
