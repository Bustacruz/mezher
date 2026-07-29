import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ChallengeCard } from "@/components/challenge-card";
import { ChildAvatar } from "@/components/child-avatar";
import { challengesForChild, useFamily } from "@/lib/family-store";
import { COLOR_MAP } from "@/lib/family-types";

export const Route = createFileRoute("/utmaningar")({
  head: () => ({
    meta: [
      { title: "Utmaningar – Vår Familj" },
      {
        name: "description",
        content:
          "Utmaningar med brons-, silver- och guldmedaljer för varje barn i familjen.",
      },
      { property: "og:title", content: "Utmaningar – Vår Familj" },
      {
        property: "og:description",
        content: "Samla brons, silver och guld på familjens utmaningar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UtmaningarPage,
});

function UtmaningarPage() {
  const state = useFamily();
  return (
    <AppShell>
      <div className="px-1 space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          🏅 Utmaningar
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold font-display">
          Samla medaljer
        </h2>
      </div>
      {state.children.map((child) => {
        const c = COLOR_MAP[child.color];
        const list = challengesForChild(state, child.id);
        return (
          <section key={child.id} className="space-y-4">
            <div className="flex items-center gap-4">
              <ChildAvatar child={child} size={72} />
              <h3 className={`text-2xl font-semibold font-display ${c.text}`}>
                {child.name}
              </h3>
            </div>
            {list.length === 0 ? (
              <p className="text-sm text-zinc-500 px-1">
                Inga utmaningar än – skapa dem i Föräldraläget.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((ch) => (
                  <ChallengeCard key={ch.id} challenge={ch} child={child} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </AppShell>
  );
}