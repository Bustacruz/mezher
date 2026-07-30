import { fireBigConfetti, fireConfetti, fireStarBurst } from "./confetti";

const DAY_EVENT = "family-day-complete";

export interface DayCompleteDetail {
  childName: string;
  childEmoji: string;
  total: number;
}

/** Liten festlig feedback när en uppgift bockas av. */
export function celebrateTask(target?: Element | null) {
  fireStarBurst(target ?? null);
  if (!target) fireConfetti();
  playChime([880, 1320]);
}

/** Stor fest när ett barn klarat alla dagens uppgifter. */
export function celebrateDay(detail: DayCompleteDetail) {
  fireBigConfetti();
  playChime([523, 659, 784, 1046], 0.16);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DAY_EVENT, { detail }));
  }
}

export function onDayComplete(cb: (d: DayCompleteDetail) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<DayCompleteDetail>).detail);
  window.addEventListener(DAY_EVENT, handler);
  return () => window.removeEventListener(DAY_EVENT, handler);
}

function playChime(notes: number[], step = 0.12) {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const t = ctx.currentTime + i * step;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + step + 0.15);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + step + 0.2);
    });
  } catch {
    // ignore
  }
}
