import { useState } from "react";
import type { Child, Reward } from "@/lib/family-types";
import { COLOR_MAP } from "@/lib/family-types";
import { redeemReward } from "@/lib/family-store";
import { fireConfetti } from "@/lib/confetti";

export function RewardCard({ reward, child }: { reward: Reward; child: Child }) {
  const [justRedeemed, setJustRedeemed] = useState(false);
  const c = COLOR_MAP[child.color];
  const affordable = child.points >= reward.cost;
  const remaining = Math.max(0, reward.cost - child.points);

  const handle = () => {
    if (!affordable) return;
    if (redeemReward(reward.id, child.id)) {
      setJustRedeemed(true);
      fireConfetti();
      setTimeout(() => setJustRedeemed(false), 800);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={!affordable}
      className={`text-left bg-white ring-1 ring-black/5 p-5 rounded-[24px] space-y-3 transition-transform ${affordable ? "hover:scale-[1.03] active:scale-[0.98]" : "opacity-60 cursor-not-allowed"} ${justRedeemed ? "animate-pop-in" : ""}`}
    >
      <div className="aspect-square bg-card-soft rounded-2xl grid place-items-center text-8xl leading-none">
        {reward.emoji}
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm font-display">{reward.title}</p>
        <p className={`text-sm font-bold ${affordable ? c.text : "text-zinc-400"}`}>
          {reward.cost} ⭐
        </p>
        {!affordable && (
          <p className="text-[11px] text-zinc-400">{remaining} poäng kvar</p>
        )}
        {affordable && (
          <p className="text-[11px] text-green-600 font-semibold">
            Tryck för att lösa in 🎉
          </p>
        )}
      </div>
    </button>
  );
}