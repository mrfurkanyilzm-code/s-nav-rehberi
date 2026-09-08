type StatusTone = "MASTERED" | "PRACTICE_NEEDED" | "CONCEPT_REQUIRED" | null;

type Tone = {
  freq: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
};

let ctx: AudioContext | null = null;

function audioContext() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function playTones(tones: Tone[]) {
  const audio = audioContext();
  if (!audio) return;
  void audio.resume();
  const now = audio.currentTime;
  for (const tone of tones) {
    const start = now + (tone.delay ?? 0);
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = tone.type ?? "sine";
    osc.frequency.setValueAtTime(tone.freq, start);
    const volume = tone.gain ?? 0.08;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + tone.duration + 0.02);
  }
}

export function playFieldSwitch() {
  playTones([
    { freq: 523.25, duration: 0.07, type: "triangle", gain: 0.06 },
    { freq: 659.25, duration: 0.1, delay: 0.06, type: "triangle", gain: 0.07 },
  ]);
}

export function playStatusSound(status: StatusTone) {
  if (status === "MASTERED") {
    playTones([
      { freq: 523.25, duration: 0.08, type: "sine", gain: 0.07 },
      { freq: 659.25, duration: 0.1, delay: 0.07, type: "sine", gain: 0.07 },
      { freq: 783.99, duration: 0.14, delay: 0.14, type: "sine", gain: 0.08 },
    ]);
    return;
  }
  if (status === "PRACTICE_NEEDED") {
    playTones([
      { freq: 440, duration: 0.09, type: "triangle", gain: 0.07 },
      { freq: 554.37, duration: 0.12, delay: 0.08, type: "triangle", gain: 0.06 },
    ]);
    return;
  }
  if (status === "CONCEPT_REQUIRED") {
    playTones([
      { freq: 311.13, duration: 0.12, type: "sine", gain: 0.07 },
      { freq: 246.94, duration: 0.16, delay: 0.1, type: "sine", gain: 0.06 },
    ]);
    return;
  }
  playTones([{ freq: 196, duration: 0.06, type: "sine", gain: 0.05 }]);
}
