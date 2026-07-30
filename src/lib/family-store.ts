import { useSyncExternalStore } from "react";
import type {
  Challenge,
  Child,
  FamilyGoal,
  FamilyState,
  MedalLevel,
  Reward,
  Task,
} from "./family-types";
import { houseLevelFor } from "./house";

const STORAGE_KEY = "var-familj-v1";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function defaultState(): FamilyState {
  const elsa: Child = {
    id: "c1",
    name: "Elsa",
    emoji: "👧",
    color: "pink",
    points: 120,
    streaks: {},
    history: [],
    badges: ["Tandspecialist"],
  };
  const leo: Child = {
    id: "c2",
    name: "Leo",
    emoji: "🧒",
    color: "blue",
    points: 450,
    streaks: {},
    history: [],
    badges: ["Städhjälte", "Veckans hjälte"],
  };
  const nils: Child = {
    id: "c3",
    name: "Nils",
    emoji: "👦",
    color: "amber",
    points: 85,
    streaks: {},
    history: [],
    badges: [],
  };

  const mkTask = (
    t: Omit<Task, "id" | "completedDates" | "pendingApproval">,
  ): Task => ({
    ...t,
    id: uid(),
    completedDates: [],
    pendingApproval: [],
  });

  const tasks: Task[] = [
    mkTask({ childId: "all", title: "Borsta tänder", emoji: "🪥", points: 10, slot: "morgon", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Klä på sig", emoji: "👕", points: 15, slot: "morgon", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Bädda sängen", emoji: "🛏️", points: 10, slot: "morgon", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Packa skolväska", emoji: "🎒", points: 10, slot: "dag", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Städa leksaker", emoji: "🧸", points: 15, slot: "dag", frequency: "daglig", requiresApproval: true }),
    mkTask({ childId: "all", title: "Mata husdjur", emoji: "🐶", points: 10, slot: "dag", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Duscha", emoji: "🛁", points: 15, slot: "kvall", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Borsta tänder", emoji: "🪥", points: 10, slot: "kvall", frequency: "daglig", requiresApproval: false }),
    mkTask({ childId: "all", title: "Läsa bok", emoji: "📚", points: 20, slot: "kvall", frequency: "daglig", requiresApproval: false }),
  ];

  const rewards: Reward[] = [
    { id: uid(), title: "Glass", emoji: "🍦", cost: 25, childId: "all" },
    { id: uid(), title: "Fredagsfilm", emoji: "🎬", cost: 50, childId: "all" },
    { id: uid(), title: "Extra skärmtid", emoji: "📱", cost: 75, childId: "all" },
    { id: uid(), title: "Leksak", emoji: "🎁", cost: 200, childId: "all" },
  ];

  const goals: FamilyGoal[] = [
    { id: uid(), title: "Biokväll", emoji: "🍿", target: 500, progress: 320 },
    { id: uid(), title: "Utflykt till Leklandet", emoji: "🎢", target: 1000, progress: 750 },
    { id: uid(), title: "Familjeutflykt", emoji: "🏕️", target: 2000, progress: 900 },
  ];

  return {
    familyName: "Vår Familj",
    children: [elsa, leo, nils],
    tasks,
    rewards,
    goals,
    familyPoints: 655,
    challenges: [
      {
        id: uid(),
        title: "Modig",
        emoji: "🦁",
        description: "Du vågade prova något nytt fast det kändes läskigt.",
        childId: "all",
        metric: "karaktar",
        period: "manad",
        bronze: 1,
        silver: 3,
        gold: 6,
        awards: [],
      },
      {
        id: uid(),
        title: "Snäll",
        emoji: "💛",
        description: "Du var snäll mot någon utan att bli tillsagd.",
        childId: "all",
        metric: "karaktar",
        period: "manad",
        bronze: 1,
        silver: 3,
        gold: 6,
        awards: [],
      },
      {
        id: uid(),
        title: "Stå på sig",
        emoji: "🛡️",
        description: "Du sa vad du tyckte och stod för det.",
        childId: "all",
        metric: "karaktar",
        period: "manad",
        bronze: 1,
        silver: 3,
        gold: 6,
        awards: [],
      },
      {
        id: uid(),
        title: "Hjälpsam",
        emoji: "🤝",
        description: "Du hjälpte någon som behövde det.",
        childId: "all",
        metric: "karaktar",
        period: "manad",
        bronze: 1,
        silver: 3,
        gold: 6,
        awards: [],
      },
      {
        id: uid(),
        title: "Tålamod",
        emoji: "🧘",
        description: "Du väntade lugnt fast det var svårt.",
        childId: "all",
        metric: "karaktar",
        period: "manad",
        bronze: 1,
        silver: 3,
        gold: 6,
        awards: [],
      },
      {
        id: uid(),
        title: "Eldsjäl",
        emoji: "🔥",
        childId: "all",
        metric: "streak",
        period: "total",
        bronze: 3,
        silver: 7,
        gold: 14,
      },
    ],
    lifetimeStars: 655,
    seenHouseLevel: houseLevelFor(655),
    parentPin: "1234",
  };
}

let state: FamilyState = load();
const listeners = new Set<() => void>();

function load(): FamilyState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return migrate(JSON.parse(raw) as Partial<FamilyState>);
  } catch {
    return defaultState();
  }
}

function migrate(s: Partial<FamilyState>): FamilyState {
  const base = defaultState();
  const lifetimeStars = s.lifetimeStars ?? s.familyPoints ?? base.lifetimeStars;
  return {
    ...base,
    ...s,
    familyName: s.familyName ?? base.familyName,
    challenges: s.challenges ?? base.challenges,
    lifetimeStars,
    seenHouseLevel: s.seenHouseLevel ?? houseLevelFor(lifetimeStars),
    parentPin: s.parentPin ?? base.parentPin,
  };
}

function save() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function set(updater: (s: FamilyState) => FamilyState) {
  state = updater(state);
  save();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useFamily(): FamilyState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function resetFamily() {
  set(() => defaultState());
}

// ---------- Children ----------
export function addChild(input: { name: string; emoji: string; color: Child["color"] }) {
  set((s) => ({
    ...s,
    children: [
      ...s.children,
      {
        id: uid(),
        name: input.name,
        emoji: input.emoji || "🙂",
        color: input.color,
        points: 0,
        streaks: {},
        history: [],
        badges: [],
      },
    ],
  }));
}

export function updateChild(id: string, patch: Partial<Child>) {
  set((s) => ({
    ...s,
    children: s.children.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  }));
}

export function removeChild(id: string) {
  set((s) => ({ ...s, children: s.children.filter((c) => c.id !== id) }));
}

// ---------- Tasks ----------
export function addTask(t: Omit<Task, "id" | "completedDates" | "pendingApproval">) {
  set((s) => ({
    ...s,
    tasks: [
      ...s.tasks,
      { ...t, id: uid(), completedDates: [], pendingApproval: [] },
    ],
  }));
}

export function updateTask(id: string, patch: Partial<Task>) {
  set((s) => ({
    ...s,
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));
}

export function removeTask(id: string) {
  set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
}

function taskDoneKey(taskId: string, childId: string, date: string) {
  return `${taskId}:${childId}:${date}`;
}

export function isTaskDoneToday(task: Task, childId: string): boolean {
  const key = taskDoneKey(task.id, childId, today());
  return task.completedDates.includes(key);
}

export function isTaskPending(task: Task, childId: string): boolean {
  return task.pendingApproval.some(
    (p) => p.childId === childId && p.date === today(),
  );
}

function bumpStreak(child: Child, taskId: string): Child {
  const t = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);
  const prev = child.streaks[taskId] ?? { current: 0, best: 0, lastDay: null };
  let current = prev.current;
  if (prev.lastDay === t) current = prev.current;
  else if (prev.lastDay === y) current = prev.current + 1;
  else current = 1;
  const best = Math.max(prev.best, current);
  return {
    ...child,
    streaks: { ...child.streaks, [taskId]: { current, best, lastDay: t } },
  };
}

export function completeTask(taskId: string, childId: string) {
  set((s) => {
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task) return s;
    const t = today();
    const key = taskDoneKey(taskId, childId, t);
    if (task.completedDates.includes(key)) return s;

    if (task.requiresApproval) {
      // Add to pending approvals
      return {
        ...s,
        tasks: s.tasks.map((tt) =>
          tt.id === taskId
            ? {
                ...tt,
                pendingApproval: [...tt.pendingApproval, { childId, date: t }],
              }
            : tt,
        ),
      };
    }

    return applyCompletion(s, taskId, childId);
  });
}

function applyCompletion(
  s: FamilyState,
  taskId: string,
  childId: string,
): FamilyState {
  const task = s.tasks.find((t) => t.id === taskId);
  if (!task) return s;
  const t = today();
  const key = taskDoneKey(taskId, childId, t);
  return {
    ...s,
    tasks: s.tasks.map((tt) =>
      tt.id === taskId
        ? {
            ...tt,
            completedDates: [...tt.completedDates, key],
            pendingApproval: tt.pendingApproval.filter(
              (p) => !(p.childId === childId && p.date === t),
            ),
          }
        : tt,
    ),
    children: s.children.map((c) => {
      if (c.id !== childId) return c;
      const bumped = bumpStreak(c, taskId);
      return {
        ...bumped,
        points: c.points + task.points,
        history: [
          ...c.history,
          { date: t, taskId, points: task.points },
        ].slice(-500),
      };
    }),
    familyPoints: s.familyPoints + task.points,
    lifetimeStars: s.lifetimeStars + task.points,
  };
}

/** Ångra en avbockad uppgift (t.ex. felklick) – tar tillbaka poängen. */
export function uncompleteTask(taskId: string, childId: string, date?: string) {
  set((s) => {
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task) return s;
    const d = date ?? today();
    const key = taskDoneKey(taskId, childId, d);
    if (!task.completedDates.includes(key)) return s;
    return {
      ...s,
      tasks: s.tasks.map((tt) =>
        tt.id === taskId
          ? {
              ...tt,
              completedDates: tt.completedDates.filter((k) => k !== key),
            }
          : tt,
      ),
      children: s.children.map((c) => {
        if (c.id !== childId) return c;
        const idx = c.history
          .map((h, i) => ({ h, i }))
          .filter(({ h }) => h.taskId === taskId && h.date === d)
          .pop()?.i;
        const history =
          idx === undefined
            ? c.history
            : c.history.filter((_, i) => i !== idx);
        const streak = c.streaks[taskId];
        return {
          ...c,
          points: Math.max(0, c.points - task.points),
          history,
          streaks: streak
            ? {
                ...c.streaks,
                [taskId]: {
                  ...streak,
                  current: Math.max(0, streak.current - 1),
                  lastDay: null,
                },
              }
            : c.streaks,
        };
      }),
      familyPoints: Math.max(0, s.familyPoints - task.points),
      lifetimeStars: Math.max(0, s.lifetimeStars - task.points),
    };
  });
}

/** Alla avbockningar idag, för föräldraläget. */
export function completedToday(
  s: FamilyState,
): { task: Task; childId: string }[] {
  const d = today();
  const out: { task: Task; childId: string }[] = [];
  for (const t of s.tasks) {
    for (const key of t.completedDates) {
      const [tid, childId, date] = key.split(":");
      if (tid === t.id && date === d) out.push({ task: t, childId });
    }
  }
  return out;
}

export function approvePending(taskId: string, childId: string) {
  set((s) => applyCompletion(s, taskId, childId));
}

export function rejectPending(taskId: string, childId: string) {
  set((s) => ({
    ...s,
    tasks: s.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            pendingApproval: t.pendingApproval.filter(
              (p) => !(p.childId === childId && p.date === today()),
            ),
          }
        : t,
    ),
  }));
}

// ---------- Rewards ----------
export function addReward(r: Omit<Reward, "id">) {
  set((s) => ({ ...s, rewards: [...s.rewards, { ...r, id: uid() }] }));
}
export function updateReward(id: string, patch: Partial<Reward>) {
  set((s) => ({
    ...s,
    rewards: s.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  }));
}
export function removeReward(id: string) {
  set((s) => ({ ...s, rewards: s.rewards.filter((r) => r.id !== id) }));
}
export function redeemReward(rewardId: string, childId: string): boolean {
  const child = state.children.find((c) => c.id === childId);
  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!child || !reward || child.points < reward.cost) return false;
  set((s) => ({
    ...s,
    children: s.children.map((c) =>
      c.id === childId ? { ...c, points: c.points - reward.cost } : c,
    ),
  }));
  return true;
}

// ---------- Family goals ----------
export function addGoal(g: Omit<FamilyGoal, "id" | "progress">) {
  set((s) => ({
    ...s,
    goals: [...s.goals, { ...g, id: uid(), progress: 0 }],
  }));
}
export function removeGoal(id: string) {
  set((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
}
export function updateGoal(id: string, patch: Partial<FamilyGoal>) {
  set((s) => ({
    ...s,
    goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  }));
}
export function contributeToGoal(goalId: string, amount: number) {
  set((s) => ({
    ...s,
    goals: s.goals.map((g) =>
      g.id === goalId
        ? { ...g, progress: Math.min(g.target, g.progress + amount) }
        : g,
    ),
  }));
}

// ---------- Helpers ----------
export function tasksForChild(
  s: FamilyState,
  childId: string,
): Task[] {
  return s.tasks.filter(
    (t) => t.childId === "all" || t.childId === childId,
  );
}

export function todayString() {
  return today();
}

export function pointsToday(child: Child): number {
  const t = today();
  return child.history
    .filter((h) => h.date === t)
    .reduce((sum, h) => sum + h.points, 0);
}

export function pointsThisWeek(child: Child): number {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const startStr = start.toISOString().slice(0, 10);
  return child.history
    .filter((h) => h.date >= startStr)
    .reduce((sum, h) => sum + h.points, 0);
}

export function bestStreak(child: Child): number {
  return Object.values(child.streaks).reduce(
    (m, s) => Math.max(m, s.current),
    0,
  );
}

export function progressToday(
  s: FamilyState,
  childId: string,
): { done: number; total: number } {
  const list = tasksForChild(s, childId).filter(
    (t) => t.frequency === "daglig",
  );
  const done = list.filter((t) => isTaskDoneToday(t, childId)).length;
  return { done, total: list.length };
}

// ---------- Familj ----------
export function setFamilyName(name: string) {
  set((s) => ({ ...s, familyName: name }));
}

// ---------- Superkrafter ----------
export function addChallenge(c: Omit<Challenge, "id">) {
  set((s) => ({ ...s, challenges: [...s.challenges, { ...c, id: uid() }] }));
}
export function updateChallenge(id: string, patch: Partial<Challenge>) {
  set((s) => ({
    ...s,
    challenges: s.challenges.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    ),
  }));
}
export function removeChallenge(id: string) {
  set((s) => ({ ...s, challenges: s.challenges.filter((c) => c.id !== id) }));
}

/** Förälder ger ett barn en superkraft (metric = "karaktar"). */
export function awardSuperpower(challengeId: string, childId: string) {
  set((s) => ({
    ...s,
    challenges: s.challenges.map((c) =>
      c.id === challengeId
        ? { ...c, awards: [...(c.awards ?? []), { date: today(), childId }] }
        : c,
    ),
  }));
}

/** Ta bort senaste tilldelade superkraften för ett barn. */
export function removeSuperpowerAward(challengeId: string, childId: string) {
  set((s) => ({
    ...s,
    challenges: s.challenges.map((c) => {
      if (c.id !== challengeId) return c;
      const list = [...(c.awards ?? [])];
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].childId === childId) {
          list.splice(i, 1);
          break;
        }
      }
      return { ...c, awards: list };
    }),
  }));
}

function periodStart(period: Challenge["period"]): string {
  if (period === "total") return "0000-00-00";
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (period === "vecka" ? 6 : 29));
  return start.toISOString().slice(0, 10);
}

export function challengeValue(c: Challenge, child: Child): number {
  if (c.metric === "streak") return bestStreak(child);
  const from = periodStart(c.period);
  if (c.metric === "karaktar") {
    return (c.awards ?? []).filter(
      (a) => a.childId === child.id && a.date >= from,
    ).length;
  }
  const rows = child.history.filter((h) => h.date >= from);
  return c.metric === "poang"
    ? rows.reduce((sum, h) => sum + h.points, 0)
    : rows.length;
}

export function challengeMedal(
  c: Challenge,
  child: Child,
): { value: number; medal: MedalLevel | null; next: number | null } {
  const value = challengeValue(c, child);
  const medal: MedalLevel | null =
    value >= c.gold
      ? "guld"
      : value >= c.silver
        ? "silver"
        : value >= c.bronze
          ? "brons"
          : null;
  const next =
    value < c.bronze
      ? c.bronze
      : value < c.silver
        ? c.silver
        : value < c.gold
          ? c.gold
          : null;
  return { value, medal, next };
}

export function challengesForChild(s: FamilyState, childId: string) {
  return s.challenges.filter(
    (c) => c.childId === "all" || c.childId === childId,
  );
}

// ---------- Huset ----------
export function currentHouseLevel(s: FamilyState): number {
  return houseLevelFor(s.lifetimeStars);
}
export function markHouseLevelSeen(level: number) {
  set((s) => ({ ...s, seenHouseLevel: Math.max(s.seenHouseLevel, level) }));
}

// ---------- Föräldrakod ----------
export function setParentPin(pin: string) {
  set((s) => ({ ...s, parentPin: pin }));
}
export function checkParentPin(pin: string): boolean {
  return state.parentPin === pin;
}