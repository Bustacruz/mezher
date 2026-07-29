import { challengeMedal } from "@/lib/family-store";
import type { Challenge, Child } from "@/lib/family-types";
import { MEDAL_STYLE, PERIOD_LABEL } from "@/lib/family-types";

export function ChallengeCard({
  challenge,
  child,
}: {
  challenge: Challenge;
  child: Child;
}) {
  const { value, medal, next } = challengeMedal(challenge, child);
  const style = medal ? MEDAL_STYLE[medal] : null;
  const target = next ?? challenge.gold;
  const pct = Math.min(100, Math.round((value / target) * 100));

  return (
    <div
      className={`rounded-[28px] p-5 space-y-3 ring-1 ${
        style ? `${style.bg} ${style.ring}` : "bg-white ring-black/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-6xl leading-none">{challenge.emoji}</span>
        <span className="text-6xl leading-none ml-auto">
          {style ? style.emoji : "⚪"}
        </span>
      </div>
      <div>
        <p className="font-semibold font-display text-lg">{challenge.title}</p>
        <p className="text-xs text-zinc-500 font-medium">
          {PERIOD_LABEL[challenge.period]} · {value} av {target}
        </p>
      </div>
      <div className="h-3 bg-white/80 rounded-full overflow-hidden ring-1 ring-black/5">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: `${Math.max(3, pct)}%` }}
        />
      </div>
      <div className="flex gap-2 text-xs font-bold">
        <span className={value >= challenge.bronze ? "" : "opacity-40"}>
          🥉 {challenge.bronze}
        </span>
        <span className={value >= challenge.silver ? "" : "opacity-40"}>
          🥈 {challenge.silver}
        </span>
        <span className={value >= challenge.gold ? "" : "opacity-40"}>
          🥇 {challenge.gold}
        </span>
      </div>
    </div>
  );
}