let audioContext: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let beepInterval: ReturnType<typeof setInterval> | null = null;

function beep(ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.4);

  activeOscillators.push(oscillator);
  oscillator.onended = () => {
    activeOscillators = activeOscillators.filter((o) => o !== oscillator);
  };
}

export function playAlarmSound() {
  if (typeof window === "undefined" || beepInterval) return;

  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  audioContext = new Ctx();

  beep(audioContext);
  beepInterval = setInterval(() => {
    if (audioContext) beep(audioContext);
  }, 600);
}

export function stopAlarmSound() {
  if (beepInterval) {
    clearInterval(beepInterval);
    beepInterval = null;
  }
  activeOscillators.forEach((o) => {
    try {
      o.stop();
    } catch {
      // already stopped
    }
  });
  activeOscillators = [];
  audioContext?.close();
  audioContext = null;
}
