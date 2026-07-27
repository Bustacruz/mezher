import type { FamilyGoal } from "@/lib/family-types";

export function FamilyGoalCard({ goal }: { goal: FamilyGoal }) {
  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
  return (
    <div className="bg-accent-light ring-1 ring-black/5 p-6 md:p-8 rounded-[32px] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-accent uppercase tracking-wider text-xs font-bold">
            <span>🏆 Familjemål</span>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold font-display tracking-tight truncate">
            {goal.emoji} {goal.title}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl md:text-3xl font-bold font-display text-accent">
            {goal.progress}
          </span>
          <span className="text-zinc-400 font-medium"> / {goal.target}</span>
        </div>
      </div>
      <div className="relative w-full h-6 md:h-8 bg-white/60 rounded-2xl ring-1 ring-black/5 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent rounded-2xl transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs font-bold text-accent/80 uppercase tracking-wider">
        {pct}% klart
      </p>
    </div>
  );
}