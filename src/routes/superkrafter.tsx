import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SuperpowerCard } from "@/components/superpower-card";
import { ChildAvatar } from "@/components/child-avatar";
import { challengesForChild, useFamily } from "@/lib/family-store";
import { COLOR_MAP } from "@/lib/family-types";

export const Route = createFileRoute("/superkrafter")({
  head: () => ({
    meta: [
      { title: "Superkrafter – Vår Familj" },
      {
        name: "description",
        content:
          "Barnens superkrafter: modig, snäll, hjälpsam och mer. Samla brons, silver och guld för karaktär som växer.",
      },
      { property: "og:title", content: "Superkrafter – Vår Familj" },
      {
        property: "og:description",
        content: "Samla superkrafter som bygger karaktär – brons, silver och guld.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuperkrafterPage,
});

function SuperkrafterPage() {
  const state = useFamily();
  return (
    <AppShell>
      <div className="px-1 space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          🦸 Superkrafter
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold font-display">
          Krafter som bygger karaktär
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
                Inga superkrafter än – skapa dem i Föräldraläget.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((ch) => (
                  <SuperpowerCard key={ch.id} challenge={ch} child={child} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </AppShell>
  );
}
