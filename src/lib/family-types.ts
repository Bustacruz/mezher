export type KidColor =
  | "pink"
  | "blue"
  | "amber"
  | "violet"
  | "green"
  | "rose";

export type RoutineSlot = "morgon" | "dag" | "kvall";
export type Frequency = "daglig" | "veckovis" | "manatlig" | "engangs";

export interface Child {
  id: string;
  name: string;
  emoji: string;
  photoUrl?: string;
  color: KidColor;
  points: number;
  streaks: Record<string, { current: number; best: number; lastDay: string | null }>;
  history: { date: string; taskId: string; points: number }[];
  badges: string[];
  /** Manuellt satt progress per märke (badgeId -> värde). Åsidosätter beräknat värde. */
  badgeProgress?: Record<string, number>;
}

export interface Task {
  id: string;
  childId: string | "all";
  title: string;
  emoji: string;
  points: number;
  slot: RoutineSlot;
  frequency: Frequency;
  requiresApproval: boolean;
  completedDates: string[]; // YYYY-MM-DD per completion
  pendingApproval: { date: string; childId: string }[];
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  cost: number;
  childId: string | "all";
}

export interface FamilyGoal {
  id: string;
  title: string;
  emoji: string;
  target: number;
  progress: number;
}

export type ChallengeMetric = "uppgifter" | "poang" | "streak" | "karaktar";
export type ChallengePeriod = "vecka" | "manad" | "total";
export type MedalLevel = "brons" | "silver" | "guld";

export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  childId: string | "all";
  metric: ChallengeMetric;
  period: ChallengePeriod;
  bronze: number;
  silver: number;
  gold: number;
  /** Beskrivning av superkraften, t.ex. "Du vågade prova något nytt". */
  description?: string;
  /** Manuellt tilldelade superkrafter (metric = "karaktar"). */
  awards?: { date: string; childId: string }[];
}

export interface FamilyState {
  familyName: string;
  children: Child[];
  tasks: Task[];
  rewards: Reward[];
  goals: FamilyGoal[];
  familyPoints: number;
  challenges: Challenge[];
  /** Totalt antal stjärnor familjen någonsin tjänat – driver husets nivå. */
  lifetimeStars: number;
  /** Högsta hus-nivå som barnen har sett firandet för. */
  seenHouseLevel: number;
  parentPin: string;
}

export const MEDAL_STYLE: Record<
  MedalLevel,
  { label: string; emoji: string; ring: string; bg: string }
> = {
  brons: { label: "Brons", emoji: "🥉", ring: "ring-amber-700/30", bg: "bg-amber-50" },
  silver: { label: "Silver", emoji: "🥈", ring: "ring-zinc-400/40", bg: "bg-zinc-50" },
  guld: { label: "Guld", emoji: "🥇", ring: "ring-amber-400/50", bg: "bg-amber-100" },
};

export const METRIC_LABEL: Record<ChallengeMetric, string> = {
  uppgifter: "Avklarade uppgifter",
  poang: "Intjänade stjärnor",
  streak: "Bästa streak",
  karaktar: "Ges av förälder",
};

export const PERIOD_LABEL: Record<ChallengePeriod, string> = {
  vecka: "Denna vecka",
  manad: "Denna månad",
  total: "Totalt",
};

export const COLOR_MAP: Record<
  KidColor,
  { bg: string; soft: string; text: string; ring: string; dot: string }
> = {
  pink: {
    bg: "bg-kid-pink",
    soft: "bg-kid-pink-soft",
    text: "text-kid-pink",
    ring: "ring-kid-pink",
    dot: "bg-kid-pink",
  },
  blue: {
    bg: "bg-kid-blue",
    soft: "bg-kid-blue-soft",
    text: "text-kid-blue",
    ring: "ring-kid-blue",
    dot: "bg-kid-blue",
  },
  amber: {
    bg: "bg-kid-amber",
    soft: "bg-kid-amber-soft",
    text: "text-kid-amber",
    ring: "ring-kid-amber",
    dot: "bg-kid-amber",
  },
  violet: {
    bg: "bg-kid-violet",
    soft: "bg-kid-violet-soft",
    text: "text-kid-violet",
    ring: "ring-kid-violet",
    dot: "bg-kid-violet",
  },
  green: {
    bg: "bg-kid-green",
    soft: "bg-kid-green-soft",
    text: "text-kid-green",
    ring: "ring-kid-green",
    dot: "bg-kid-green",
  },
  rose: {
    bg: "bg-kid-rose",
    soft: "bg-kid-rose-soft",
    text: "text-kid-rose",
    ring: "ring-kid-rose",
    dot: "bg-kid-rose",
  },
};

export const SLOT_LABEL: Record<RoutineSlot, string> = {
  morgon: "Morgon ☀️",
  dag: "Dag 🌤️",
  kvall: "Kväll 🌙",
};