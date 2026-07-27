import { Link } from "@tanstack/react-router";
import type { Child, FamilyState } from "@/lib/family-types";
import { COLOR_MAP } from "@/lib/family-types";
import { bestStreak, progressToday } from "@/lib/family-store";

export function ProfileCard({
  child,
  state,
}: {
  child: Child;
  state: FamilyState;
}) {
  const c = COLOR_MAP[child.color];
  const streak = bestStreak(child);
  const { done, total } = progressToday(state, child.id);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link
      to="/barn/$id"
      params={{ id: child.id }}
      className={`group ${c.soft} ring-2 ${c.ring}/40 p-4 md:p-6 rounded-[24px] transition-transform hover:scale-[1.02] active:scale-[0.99] block`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="size-20 md:size-24 rounded-full bg-white outline outline-white ring-4 ring-white/60 grid place-items-center text-5xl md:text-6xl shadow-sm">
            {child.emoji}
          </div>
          {streak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-white ring-1 ring-black/5 px-2 py-0.5 rounded-full text-xs font-bold">
              🔥 {streak}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className={`font-semibold font-display text-lg ${c.text}`}>
            {child.name}
          </h3>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {child.points} ⭐
          </p>
        </div>
        <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden">
          <div
            className={`${c.bg} h-full rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-500 font-medium">
          {done} av {total} klara idag
        </p>
      </div>
    </Link>
  );
}