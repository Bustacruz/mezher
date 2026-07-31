export interface HouseLevel {
  level: number;
  threshold: number;
  stage: string;
  stageEmoji: string;
  unlockEmoji: string;
  unlockName: string;
}

const STAGES: { until: number; name: string; emoji: string }[] = [
  { until: 4, name: "Tältplats", emoji: "⛺" },
  { until: 9, name: "Liten stuga", emoji: "🛖" },
  { until: 15, name: "Hus", emoji: "🏠" },
  { until: 22, name: "Stort hus", emoji: "🏡" },
  { until: 29, name: "Villa", emoji: "🏘️" },
  { until: 35, name: "Herrgård", emoji: "🏛️" },
  { until: 44, name: "Slott", emoji: "🏰" },
];

const UNLOCKS: { emoji: string; name: string }[] = [
  { emoji: "🌱", name: "En liten planta" },
  { emoji: "🌳", name: "Ett stort träd" },
  { emoji: "🌷", name: "Blomsterrabatt" },
  { emoji: "🐶", name: "En hund" },
  { emoji: "🪵", name: "Staket runt tomten" },
  { emoji: "🐱", name: "En katt" },
  { emoji: "🌲", name: "Granskog" },
  { emoji: "🦋", name: "Fjärilar" },
  { emoji: "🐰", name: "En kanin" },
  { emoji: "🎪", name: "Lekplats" },
  { emoji: "🦆", name: "Damm med ankor" },
  { emoji: "🌻", name: "Solrosor" },
  { emoji: "🐴", name: "En häst" },
  { emoji: "🏚️", name: "Lada" },
  { emoji: "🐔", name: "Höns" },
  { emoji: "🍎", name: "Äppelträd" },
  { emoji: "🦔", name: "En igelkott" },
  { emoji: "⛲", name: "Fontän" },
  { emoji: "🦊", name: "En räv" },
  { emoji: "🌉", name: "Bro över bäcken" },
  { emoji: "🦉", name: "En uggla" },
  { emoji: "🎠", name: "Karusell" },
  { emoji: "🐝", name: "Bikupa" },
  { emoji: "🏞️", name: "Egen park" },
  { emoji: "🦌", name: "En hjort" },
  { emoji: "🎡", name: "Pariserhjul" },
  { emoji: "🐿️", name: "Ekorrar" },
  { emoji: "🌈", name: "Regnbåge" },
  { emoji: "🦢", name: "Svanar" },
  { emoji: "⛵", name: "Segelbåt" },
  { emoji: "🐧", name: "Pingviner" },
  { emoji: "🎪", name: "Cirkustält" },
  { emoji: "🦜", name: "Papegojor" },
  { emoji: "🌋", name: "Vulkanberg" },
  { emoji: "🐘", name: "En elefant" },
  { emoji: "🚂", name: "Litet tåg" },
  { emoji: "🦁", name: "Ett lejon" },
  { emoji: "🎆", name: "Fyrverkerier" },
  { emoji: "🐉", name: "En snäll drake" },
  { emoji: "👑", name: "Kronan på slottet" },
  { emoji: "🦄", name: "En enhörning" },
  { emoji: "🌌", name: "Stjärnhimmel" },
  { emoji: "🏵️", name: "Kunglig trädgård" },
  { emoji: "🎇", name: "Magiskt ljussken" },
];

function stageFor(level: number) {
  return STAGES.find((s) => level <= s.until) ?? STAGES[STAGES.length - 1];
}

export const HOUSE_LEVELS: HouseLevel[] = Array.from(
  { length: 44 },
  (_, i): HouseLevel => {
    const level = i + 1;
    const st = stageFor(level);
    const u = UNLOCKS[i % UNLOCKS.length];
    return {
      level,
      threshold: Math.round((250 * Math.pow(level, 1.55)) / 50) * 50,
      stage: st.name,
      stageEmoji: st.emoji,
      unlockEmoji: u.emoji,
      unlockName: u.name,
    };
  },
);

export function houseLevelFor(stars: number): number {
  let lvl = 0;
  for (const l of HOUSE_LEVELS) if (stars >= l.threshold) lvl = l.level;
  return lvl;
}

export function nextHouseLevel(stars: number): HouseLevel | null {
  return HOUSE_LEVELS.find((l) => stars < l.threshold) ?? null;
}

export function currentStage(level: number) {
  return stageFor(Math.max(1, level));
}

/** Alla dekorationer som är upplåsta vid en viss nivå. */
export function unlockedDecor(level: number): HouseLevel[] {
  return HOUSE_LEVELS.filter((l) => l.level <= level);
}