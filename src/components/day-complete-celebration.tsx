import { useEffect, useState } from "react";
import { onDayComplete, type DayCompleteDetail } from "@/lib/celebrate";

export function DayCompleteCelebration() {
  const [detail, setDetail] = useState<DayCompleteDetail | null>(null);

  useEffect(
    () =>
      onDayComplete((d) => {
        setDetail(d);
        const t = setTimeout(() => setDetail(null), 6000);
        return () => clearTimeout(t);
      }),
    [],
  );

  if (!detail) return null;

  return (
    <div
      onClick={() => setDetail(null)}
      className="fixed inset-0 z-[9997] grid place-items-center bg-ink/70 backdrop-blur-sm animate-overlay-in p-6"
    >
      <div className="bg-white rounded-[40px] px-8 py-10 max-w-md w-full text-center space-y-4 animate-trophy-in shadow-2xl">
        <div className="text-[7rem] leading-none animate-float-bob">🏆</div>
        <div className="text-6xl leading-none">{detail.childEmoji}</div>
        <h2 className="text-3xl font-semibold font-display">
          {detail.childName} klarade allt!
        </h2>
        <p className="text-lg text-zinc-500 font-medium">
          {detail.total} uppgifter avklarade idag 🎉
        </p>
        <div className="flex justify-center gap-3 text-5xl">
          <span className="animate-float-bob">⭐</span>
          <span className="animate-float-bob" style={{ animationDelay: "0.2s" }}>
            🎈
          </span>
          <span className="animate-float-bob" style={{ animationDelay: "0.4s" }}>
            ✨
          </span>
        </div>
        <button className="w-full py-4 bg-brand text-white rounded-3xl font-semibold text-lg">
          Woho!
        </button>
      </div>
    </div>
  );
}
