import type { Child, FamilyState } from "./family-types";
import { bestStreak } from "./family-store";

export type BadgeMetric =
  | "poang"
  | "uppgifter"
  | "streak"
  | "superkrafter"
  | "dagar";

export interface BadgeDef {
  id: string;
  title: string;
  emoji: string;
  description: string;
  metric: BadgeMetric;
  target: number;
}

export const BADGE_METRIC_LABEL: Record<BadgeMetric, string> = {
  poang: "Poäng totalt",
  uppgifter: "Avklarade uppgifter",
  streak: "Längsta streak (dagar)",
  superkrafter: "Superkrafter",
  dagar: "Aktiva dagar",
};

export const BADGES: BadgeDef[] = [
  { id: "forsta-steget", title: "Första steget", emoji: "🌱", description: "Klara din första uppgift", metric: "uppgifter", target: 1 },
  { id: "igangsattare", title: "Igångsättare", emoji: "🚀", description: "Klara 10 uppgifter", metric: "uppgifter", target: 10 },
  { id: "uppgiftsmastare", title: "Uppgiftsmästare", emoji: "🎯", description: "Klara 50 uppgifter", metric: "uppgifter", target: 50 },
  { id: "superhjalte", title: "Superhjälte", emoji: "🦸", description: "Klara 200 uppgifter", metric: "uppgifter", target: 200 },
  { id: "legend", title: "Legend", emoji: "👑", description: "Klara 500 uppgifter", metric: "uppgifter", target: 500 },

  { id: "stjarnsamlare", title: "Stjärnsamlare", emoji: "⭐", description: "Samla 50 poäng", metric: "poang", target: 50 },
  { id: "stjarnjagare", title: "Stjärnjägare", emoji: "🌟", description: "Samla 250 poäng", metric: "poang", target: 250 },
  { id: "stjarnkung", title: "Stjärnkung", emoji: "💫", description: "Samla 1000 poäng", metric: "poang", target: 1000 },

  { id: "tre-i-rad", title: "Tre i rad", emoji: "🔥", description: "3 dagar i rad", metric: "streak", target: 3 },
  { id: "veckohjalte", title: "Veckohjälte", emoji: "📅", description: "7 dagar i rad", metric: "streak", target: 7 },
  { id: "manadsmastare", title: "Månadsmästare", emoji: "🏅", description: "30 dagar i rad", metric: "streak", target: 30 },

  { id: "karaktar-1", title: "Modig start", emoji: "💪", description: "Få din första superkraft", metric: "superkrafter", target: 1 },
  { id: "karaktar-5", title: "Hjärta av guld", emoji: "❤️", description: "Få 5 superkrafter", metric: "superkrafter", target: 5 },
  { id: "karaktar-15", title: "Karaktärsstjärna", emoji: "🌈", description: "Få 15 superkrafter", metric: "superkrafter", target: 15 },

  { id: "dagar-10", title: "Trogen kompis", emoji: "🐾", description: "Var aktiv 10 olika dagar", metric: "dagar", target: 10 },
  { id: "dagar-50", title: "Rutinproffs", emoji: "🧭", description: "Var aktiv 50 olika dagar", metric: "dagar", target: 50 },
  { id: "dagar-150", title: "Årets stjärna", emoji: "🏆", description: "Var aktiv 150 olika dagar", metric: "dagar", target: 150 },
];

/** Automatiskt beräknat värde för ett märke (utan föräldrarnas justering). */
export function autoBadgeValue(
  state: FamilyState,
  child: Child,
  badge: BadgeDef,
): number {
  switch (badge.metric) {
    case "poang":
      return child.history.reduce((sum, h) => sum + h.points, 0);
    case "uppgifter":
      return child.history.length;
    case "streak":
      return bestStreak(child);
    case "superkrafter":
      return state.challenges.reduce(
        (sum, c) =>
          sum + (c.awards ?? []).filter((a) => a.childId === child.id).length,
        0,
      );
    case "dagar":
      return new Set(child.history.map((h) => h.date)).size;
  }
}

export interface BadgeStatus {
  badge: BadgeDef;
  value: number;
  auto: number;
  manual: boolean;
  unlocked: boolean;
  remaining: number;
  percent: number;
}

export function badgeStatus(
  state: FamilyState,
  child: Child,
  badge: BadgeDef,
): BadgeStatus {
  const auto = autoBadgeValue(state, child, badge);
  const override = child.badgeProgress?.[badge.id];
  const value = override ?? auto;
  return {
    badge,
    value,
    auto,
    manual: override !== undefined,
    unlocked: value >= badge.target,
    remaining: Math.max(0, badge.target - value),
    percent: Math.min(100, Math.round((value / badge.target) * 100)),
  };
}

export function badgeStatuses(state: FamilyState, child: Child): BadgeStatus[] {
  return BADGES.map((b) => badgeStatus(state, child, b));
}
