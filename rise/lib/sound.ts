import { SceneDef } from "@/lib/scenes";

interface ActiveSession {
  ctx: AudioContext;
  master: GainNode;
  nodes: AudioScheduledSourceNode[];
}

let session: ActiveSession | null = null;

function makeNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Starts a synthesized ambient pad for the given scene and ramps volume in over `fadeSeconds`. */
export function startAmbient(
  scene: SceneDef,
  volumeStart: number,
  volumeEnd: number,
  fadeSeconds: number
) {
  stopAmbient();

  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  const start = Math.max(0.001, volumeStart / 100) * 0.35;
  const end = Math.max(0.001, volumeEnd / 100) * 0.35;
  master.gain.setValueAtTime(start, ctx.currentTime);
  master.gain.linearRampToValueAtTime(end, ctx.currentTime + Math.max(1, fadeSeconds));
  master.connect(ctx.destination);

  const nodes: AudioScheduledSourceNode[] = [];

  // Warm detuned pad: three low oscillators through a gentle lowpass.
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 400 + scene.tone.brightness * 800;
  padFilter.connect(master);

  [1, 1.5, 2].forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = scene.tone.baseFreq * ratio;
    osc.detune.value = (i - 1) * 6;
    const gain = ctx.createGain();
    gain.gain.value = i === 0 ? 1 : 0.4;
    osc.connect(gain);
    gain.connect(padFilter);
    osc.start();
    nodes.push(osc);

    // Slow amplitude drift so the pad breathes instead of droning flatly.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.02;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    nodes.push(lfo);
  });

  // Optional textured noise layer (rain patter / fire crackle).
  if (scene.tone.noise) {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = makeNoiseBuffer(ctx);
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    if (scene.tone.noise === "rain") {
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 2200;
      noiseFilter.Q.value = 0.6;
      noiseGain.gain.value = 0.5;
    } else {
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 1800;
      noiseGain.gain.value = 0.18;
    }

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start();
    nodes.push(noiseSource);
  }

  session = { ctx, master, nodes };
}

export function stopAmbient() {
  if (!session) return;
  const { ctx, master, nodes } = session;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0.0001, now + 0.4);
  setTimeout(() => {
    nodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    });
    ctx.close();
  }, 500);
  session = null;
}

/** Guaranteed-fallback built-in tone: no scene, no filters, no dependency chain. */
export function playBackupTone() {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const beep = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };
  beep();
  const interval = setInterval(beep, 600);
  return () => {
    clearInterval(interval);
    ctx.close();
  };
}
