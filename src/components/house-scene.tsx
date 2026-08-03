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
  const sceneHeight = compact ? 240 : 380;

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

      <LivingScene
        level={level}
        stageEmoji={stage.emoji}
        stageName={stage.name}
        decor={decor}
        houseSize={houseSize}
        height={sceneHeight}
      />

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

/** Deterministiskt "slumptal" 0–1 utifrån ett heltal (samma på server & klient). */
function rnd(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
}

/** Djur som går fram och tillbaka på marken. */
const WALKERS = new Set([
  "🐶", "🐱", "🐰", "🐴", "🦔", "🦊", "🦌", "🐿️", "🐘", "🦁", "🐧", "🐔",
  "🦄",
]);
/** Saker som flyger runt i luften. */
const FLYERS = new Set(["🦋", "🐝", "🦉", "🦜", "🐉"]);
/** Saker som guppar på vattnet. */
const FLOATERS = new Set(["🦆", "🦢", "⛵"]);
/** Saker som snurrar. */
const SPINNERS = new Set(["🎡", "🎠", "⛲"]);
/** Saker som lyser/pulserar. */
const GLOWERS = new Set(["🌈", "🎆", "🎇", "🌌", "👑", "🏵️", "🌋"]);

type Decor = { level: number; unlockEmoji: string; unlockName: string };

function kindOf(emoji: string) {
  if (WALKERS.has(emoji)) return "walk" as const;
  if (FLYERS.has(emoji)) return "fly" as const;
  if (FLOATERS.has(emoji)) return "float" as const;
  if (SPINNERS.has(emoji)) return "spin" as const;
  if (GLOWERS.has(emoji)) return "glow" as const;
  return "plant" as const;
}

function LivingScene({
  level,
  stageEmoji,
  stageName,
  decor,
  houseSize,
  height,
}: {
  level: number;
  stageEmoji: string;
  stageName: string;
  decor: Decor[];
  houseSize: number;
  height: number;
}) {
  // Visa de senaste dekorationerna i scenen; äldre ligger längst bak.
  const scene = decor.slice(-18);
  const isNight = level >= 40;
  const by = (k: ReturnType<typeof kindOf>) =>
    scene.filter((d) => kindOf(d.unlockEmoji) === k);

  return (
    <div
      className={`relative rounded-[28px] overflow-hidden ring-1 ring-white/70 select-none ${
        isNight
          ? "bg-gradient-to-b from-indigo-900 via-indigo-500 to-emerald-700"
          : "bg-gradient-to-b from-sky-300 via-sky-100 to-lime-200"
      }`}
      style={{ height }}
      role="img"
      aria-label={`${stageName} med ${decor.length} upplåsta saker`}
    >
      {/* Sol / måne */}
      <div
        className="absolute text-5xl md:text-6xl leading-none animate-sun-spin"
        style={{ top: "6%", right: "7%" }}
      >
        {isNight ? "🌙" : "☀️"}
      </div>

      {/* Stjärnor på natten */}
      {isNight &&
        Array.from({ length: 14 }, (_, i) => (
          <span
            key={`st${i}`}
            className="absolute text-xs animate-twinkle"
            style={{
              left: `${Math.round(rnd(i + 1) * 95)}%`,
              top: `${Math.round(rnd(i + 50) * 40)}%`,
              animationDelay: `${Math.round(rnd(i + 90) * 240) / 100}s`,
            }}
          >
            ✨
          </span>
        ))}

      {/* Moln som driver */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={`cl${i}`}
          className="absolute text-4xl md:text-5xl leading-none opacity-90 animate-cloud-drift"
          style={{
            top: `${6 + i * 11}%`,
            animationDuration: `${34 + i * 13}s`,
            animationDelay: `${-i * 9}s`,
          }}
        >
          ☁️
        </div>
      ))}

      {/* Fåglar som flyger över himlen */}
      {!isNight &&
        Array.from({ length: 2 }, (_, i) => (
          <div
            key={`bd${i}`}
            className="absolute text-2xl leading-none animate-flap-fly"
            style={{
              top: `${16 + i * 9}%`,
              animationDuration: `${22 + i * 9}s`,
              animationDelay: `${-i * 11}s`,
            }}
          >
            🕊️
          </div>
        ))}

      {/* Kullar */}
      <div className="absolute inset-x-0 bottom-0 h-[46%]">
        <div className="absolute -left-[10%] bottom-[38%] w-[70%] h-[70%] rounded-[50%] bg-emerald-300/70" />
        <div className="absolute -right-[12%] bottom-[40%] w-[65%] h-[65%] rounded-[50%] bg-emerald-400/60" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-lime-400 to-green-500" />
      </div>

      {/* Damm (om något flyter) */}
      {by("float").length > 0 && (
        <div className="absolute left-[6%] bottom-[6%] w-[34%] h-[12%] rounded-[50%] bg-sky-400/60 ring-2 ring-sky-200/60" />
      )}

      {/* Växter och byggnader som vajar/vickar */}
      {[...by("plant"), ...by("glow")].map((d, i) => (
        <span
          key={`b${d.level}`}
          title={d.unlockName}
          className={`absolute leading-none ${
            kindOf(d.unlockEmoji) === "glow"
              ? "animate-glow-pulse"
              : rnd(d.level) > 0.5
                ? "animate-sway"
                : "animate-wiggle-pop"
          }`}
          style={{
            left: `${Math.round(4 + rnd(d.level * 3 + 1) * 90)}%`,
            bottom: `${Math.round(18 + rnd(d.level * 7 + 2) * 22)}%`,
            fontSize: Math.round(26 + rnd(d.level * 5) * 22),
            animationDelay: `${Math.round(rnd(d.level + i) * 300) / 100}s`,
            animationDuration: `${Math.round((3 + rnd(d.level * 2) * 2.5) * 100) / 100}s`,
          }}
        >
          {d.unlockEmoji}
        </span>
      ))}

      {/* Snurrande nöjesfält */}
      {by("spin").map((d) => (
        <span
          key={`s${d.level}`}
          title={d.unlockName}
          className="absolute leading-none animate-spin-slow"
          style={{
            left: `${Math.round(8 + rnd(d.level * 17 + 4) * 80)}%`,
            bottom: `${Math.round(20 + rnd(d.level * 6) * 18)}%`,
            fontSize: Math.round(30 + rnd(d.level * 5) * 16),
            animationDuration: `${Math.round((7 + rnd(d.level) * 6) * 100) / 100}s`,
          }}
        >
          {d.unlockEmoji}
        </span>
      ))}

      {/* Flygande djur */}
      {by("fly").map((d, i) => (
        <span
          key={`f${d.level}`}
          title={d.unlockName}
          className="absolute leading-none animate-flutter"
          style={{
            left: `${Math.round(10 + rnd(d.level * 23 + 7) * 70)}%`,
            bottom: `${Math.round(35 + rnd(d.level * 19) * 30)}%`,
            fontSize: Math.round(24 + rnd(d.level * 3) * 14),
            animationDelay: `${Math.round(rnd(d.level + i * 3) * 500) / 100}s`,
            animationDuration: `${Math.round((6 + rnd(d.level * 8) * 5) * 100) / 100}s`,
          }}
        >
          {d.unlockEmoji}
        </span>
      ))}

      {/* Huset */}
      <div
        className="absolute left-1/2 -translate-x-1/2 leading-none drop-shadow-xl"
        style={{ bottom: "16%", fontSize: houseSize }}
      >
        <span className="block animate-house-breathe">
          {level === 0 ? "🟩" : stageEmoji}
        </span>
        {/* Rök ur skorstenen */}
        {level > 0 &&
          Array.from({ length: 3 }, (_, i) => (
            <span
              key={`sm${i}`}
              className="absolute text-2xl leading-none animate-smoke-rise"
              style={{
                left: "62%",
                top: "-6%",
                animationDelay: `${i * 1.3}s`,
              }}
            >
              💨
            </span>
          ))}
      </div>

      {/* Djur som guppar på dammen */}
      {by("float").map((d, i) => (
        <span
          key={`w${d.level}`}
          title={d.unlockName}
          className="absolute leading-none animate-bob-water"
          style={{
            left: `${Math.round(8 + rnd(d.level * 29 + 2) * 22)}%`,
            bottom: `${Math.round(8 + rnd(d.level * 31) * 6)}%`,
            fontSize: Math.round(26 + rnd(d.level * 7) * 14),
            animationDelay: `${Math.round(rnd(d.level + i) * 400) / 100}s`,
            animationDuration: `${Math.round((5 + rnd(d.level * 6) * 4) * 100) / 100}s`,
          }}
        >
          {d.unlockEmoji}
        </span>
      ))}

      {/* Djur som går fram och tillbaka i förgrunden */}
      {by("walk").map((d, i) => (
        <span
          key={`a${d.level}`}
          title={d.unlockName}
          className="absolute leading-none animate-walk-across"
          style={
            {
              left: `${Math.round(6 + rnd(d.level * 11 + 5) * 60)}%`,
              bottom: `${Math.round(2 + rnd(d.level * 13 + 3) * 13)}%`,
              fontSize: Math.round(30 + rnd(d.level * 9) * 20),
              "--walk": `${Math.round(60 + rnd(d.level * 3) * 180)}px`,
              animationDelay: `${Math.round(rnd(d.level + i * 2) * 600) / 100}s`,
              animationDuration: `${Math.round((11 + rnd(d.level * 4) * 9) * 100) / 100}s`,
            } as React.CSSProperties
          }
        >
          <span
            className="block animate-waddle"
            style={{
              animationDuration: `${Math.round((0.8 + rnd(d.level * 5) * 0.8) * 100) / 100}s`,
            }}
          >
            {d.unlockEmoji}
          </span>
        </span>
      ))}

      {/* Eldflugor på natten */}
      {isNight &&
        Array.from({ length: 8 }, (_, i) => (
          <span
            key={`ff${i}`}
            className="absolute text-base leading-none animate-firefly"
            style={{
              left: `${Math.round(8 + rnd(i * 3 + 11) * 84)}%`,
              bottom: `${Math.round(10 + rnd(i * 7 + 5) * 35)}%`,
              animationDelay: `${Math.round(rnd(i + 21) * 800) / 100}s`,
              animationDuration: `${Math.round((7 + rnd(i + 4) * 6) * 100) / 100}s`,
            }}
          >
            🟡
          </span>
        ))}

      {/* Gräs i förgrunden */}
      <div className="absolute inset-x-0 bottom-0 h-6 bg-green-600/70 animate-grass-wave" />
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 pointer-events-none">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={`g${i}`}
            className="text-lg leading-none animate-sway"
            style={{
              animationDelay: `${Math.round(rnd(i * 5 + 3) * 400) / 100}s`,
              animationDuration: `${Math.round((2.6 + rnd(i + 2) * 2.4) * 100) / 100}s`,
            }}
          >
            🌾
          </span>
        ))}
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
        <div className="text-[110px] leading-none animate-trophy-in">
          {stage.emoji}
        </div>
        <h2 className="text-3xl font-bold font-display">
          Huset växte till {stage.name}!
        </h2>
        <div className="space-y-2">
          {newLevels.map((l, i) => (
            <div
              key={l.level}
              className="flex items-center gap-4 bg-accent-light rounded-2xl p-3 text-left animate-grow-in"
              style={{ animationDelay: `${0.25 + i * 0.18}s` }}
            >
              <span className="text-5xl leading-none animate-sway">
                {l.unlockEmoji}
              </span>
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