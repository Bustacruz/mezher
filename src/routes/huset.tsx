import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { HouseScene } from "@/components/house-scene";
import { FamilyGoalCard } from "@/components/family-goal-card";
import { useFamily } from "@/lib/family-store";
import { HOUSE_LEVELS, houseLevelFor } from "@/lib/house";

export const Route = createFileRoute("/huset")({
  head: () => ({
    meta: [
      { title: "Huset – Vår Familj" },
      {
        name: "description",
        content:
          "Familjens hus växer när barnen samlar stjärnor tillsammans – från tält till slott med träd, djur och överraskningar.",
      },
      { property: "og:title", content: "Huset – Vår Familj" },
      {
        property: "og:description",
        content: "Samla stjärnor tillsammans och bygg ut familjens hus till ett slott.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HusetPage,
});

function HusetPage() {
  const state = useFamily();
  const level = houseLevelFor(state.lifetimeStars);

  return (
    <AppShell>
      <HouseScene />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold font-display px-1">
          🏆 Familjemål
        </h2>
        {state.goals.map((g) => (
          <FamilyGoalCard key={g.id} goal={g} />
        ))}
        <p className="text-xs text-zinc-500 px-1">
          Familjemålen ändras i Föräldraläget.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold font-display px-1">
          Alla nivåer
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HOUSE_LEVELS.map((l) => {
            const done = l.level <= level;
            return (
              <div
                key={l.level}
                className={`rounded-[24px] p-4 text-center space-y-1 ring-1 ${
                  done
                    ? "bg-white ring-black/5"
                    : "bg-zinc-100 ring-black/5 opacity-60"
                }`}
              >
                <div className="text-5xl leading-none">
                  {done ? l.unlockEmoji : "🔒"}
                </div>
                <p className="font-semibold text-sm font-display">
                  {done ? l.unlockName : `Nivå ${l.level}`}
                </p>
                <p className="text-[11px] font-bold text-zinc-800 bg-white/80 px-2 py-0.5 rounded-full inline-block">
                  {l.threshold} ⭐
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}