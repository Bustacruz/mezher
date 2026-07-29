import { useEffect, useState } from "react";
import {
  HOUSE_LEVELS,
  currentStage,
  houseLevelFor,
  nextHouseLevel,
  unlockedDecor,
} from "@/lib/house";
import { markHouseLevelSeen, useFamily } from "@/lib/family-store";
import { fireConfetti } from "@/lib/confetti";

export function HouseScene({ compact = false }: { compact?: boolean }) {
  const state = useFamily();
  const stars = state.lifetimeStars;
  const level = houseLevelFor(stars);
  const stage = currentStage(level);
  const next = nextHouseLevel(stars);
  const decor = unlockedDecor(level);
  const prevThreshold = level > 0 ? HOUSE_LEVELS[level - 1].threshold : 0;
  const pct = next
    ? Math.round(
        ((stars - prevThreshold) / (next.threshold - prevThreshold)) * 100,
      )
    : 100;
  const houseSize = compact ? 90 + level * 2.5 : 130 + level * 5;

  return (
    <div className="bg-gradient-to-b from-sky-100 to-green-100 ring-1 ring-black/5 rounded-[32px] p-5 md:p-8 space-y-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Familjens hus · Nivå {level}
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold font-display">
            {stage.emoji} {level === 0 ? "Tom tomt" : stage.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-3xl md:text-4xl font-bold font-display text-accent">
            {stars} ⭐
          </p>
          <p className="text-xs text-zinc-500 font-semibold">
            {next
              ? `${next.threshold - stars} ⭐ till nivå ${next.level}`
              : "Max nivå – slottet är klart!"}
          </p>
        </div>
      </div>

      <div
        className="relative rounded-[24px] bg-white/50 ring-1 ring-white/70 grid place-items-center py-6"
        style={{ minHeight: compact ? 180 : 260 }}
      >
        <div
          className="leading-none animate-pop-in select-none"
          style={{ fontSize: houseSize }}
          role="img"
          aria-label={stage.name}
        >
          {level === 0 ? "🟩" : stage.emoji}
        </div>
        <div className="flex flex-wrap justify-center gap-1 px-4">
          {decor.map((d) => (
            <span
              key={d.level}
              title={d.unlockName}
              className="text-3xl md:text-4xl leading-none"
            >
              {d.unlockEmoji}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="h-5 w-full bg-white/70 rounded-full overflow-hidden ring-1 ring-black/5">
          <div
            className="h-full bg-accent rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(3, pct)}%` }}
          />
        </div>
        {next && (
          <p className="mt-2 text-sm font-semibold text-zinc-600">
            Nästa: {next.unlockEmoji} {next.unlockName}
          </p>
        )}
      </div>
    </div>
  );
}

export function HouseUnlockCelebration() {
  const state = useFamily();
  const level = houseLevelFor(state.lifetimeStars);
  const [shown, setShown] = useState(false);

  const pending = level > state.seenHouseLevel && level > 0;

  useEffect(() => {
    if (pending && !shown) {
      setShown(true);
      fireConfetti();
    }
    if (!pending && shown) setShown(false);
  }, [pending, shown]);

  if (!pending) return null;

  const newLevels = HOUSE_LEVELS.filter(
    (l) => l.level > state.seenHouseLevel && l.level <= level,
  );
  const stage = currentStage(level);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="bg-white rounded-[32px] p-6 md:p-10 max-w-lg w-full text-center space-y-5 animate-pop-in">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          Nivå {level} upplåst!
        </p>
        <div className="text-[110px] leading-none">{stage.emoji}</div>
        <h2 className="text-3xl font-bold font-display">
          Huset växte till {stage.name}!
        </h2>
        <div className="space-y-2">
          {newLevels.map((l) => (
            <div
              key={l.level}
              className="flex items-center gap-4 bg-accent-light rounded-2xl p-3 text-left"
            >
              <span className="text-5xl leading-none">{l.unlockEmoji}</span>
              <div>
                <p className="font-semibold font-display text-lg">
                  {l.unlockName}
                </p>
                <p className="text-xs text-zinc-500">Nivå {l.level}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            markHouseLevelSeen(level);
            fireConfetti();
          }}
          className="w-full bg-brand text-white font-bold text-xl rounded-2xl py-4"
        >
          Hurra! 🎉
        </button>
      </div>
    </div>
  );
}