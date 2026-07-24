"use client";

import { useEffect, useRef } from "react";
import { ParticleKind } from "@/lib/scenes";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
}

const COUNTS: Record<ParticleKind, number> = {
  none: 0,
  rain: 140,
  stars: 160,
  embers: 60,
  motes: 50,
  waves: 0,
};

export function ParticleCanvas({ kind, accent }: { kind: ParticleKind; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || kind === "none" || kind === "waves") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const count = COUNTS[kind];
    const particles: Particle[] = Array.from({ length: count }, () => makeParticle(kind, width, height));

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        step(p, kind, width, height);
        draw(ctx, p, kind, accent);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [kind, accent]);

  if (kind === "none" || kind === "waves") return null;
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

function makeParticle(kind: ParticleKind, w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: kind === "stars" ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1,
    speed:
      kind === "rain"
        ? Math.random() * 8 + 10
        : kind === "embers"
          ? Math.random() * 0.6 + 0.2
          : Math.random() * 0.3 + 0.05,
    drift: Math.random() * 0.6 - 0.3,
    phase: Math.random() * Math.PI * 2,
    opacity: Math.random() * 0.6 + 0.2,
  };
}

function step(p: Particle, kind: ParticleKind, w: number, h: number) {
  if (kind === "rain") {
    p.y += p.speed;
    p.x += p.drift;
    if (p.y > h) {
      p.y = -20;
      p.x = Math.random() * w;
    }
  } else if (kind === "embers") {
    p.y -= p.speed;
    p.x += Math.sin(p.phase + p.y * 0.01) * 0.5;
    if (p.y < -20) {
      p.y = h + 20;
      p.x = Math.random() * w;
    }
  } else if (kind === "motes") {
    p.phase += 0.004;
    p.y -= p.speed;
    p.x += Math.sin(p.phase) * 0.3;
    if (p.y < -20) {
      p.y = h + 20;
      p.x = Math.random() * w;
    }
  } else if (kind === "stars") {
    p.phase += 0.02;
  }
}

function draw(ctx: CanvasRenderingContext2D, p: Particle, kind: ParticleKind, accent: string) {
  ctx.save();
  if (kind === "rain") {
    ctx.strokeStyle = `rgba(200,220,255,${p.opacity * 0.5})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.drift * 3, p.y - 16);
    ctx.stroke();
  } else if (kind === "stars") {
    const twinkle = 0.5 + Math.sin(p.phase) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${p.opacity * twinkle})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "embers" || kind === "motes") {
    ctx.fillStyle = hexToRgba(accent, p.opacity * 0.8);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
