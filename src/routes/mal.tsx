import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { FamilyGoalCard } from "@/components/family-goal-card";
import { useFamily } from "@/lib/family-store";

export const Route = createFileRoute("/mal")({
  head: () => ({
    meta: [
      { title: "Familjemål – Vår Familj" },
      {
        name: "description",
        content: "Gemensamma mål som hela familjen jobbar mot tillsammans.",
      },
    ],
  }),
  component: MalPage,
});

function MalPage() {
  const state = useFamily();
  return (
    <AppShell>
      <div className="space-y-2 px-1">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          🏆 Familjemål
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold font-display">
          Tillsammans mot något roligt
        </h2>
        <p className="text-sm text-zinc-500 max-w-xl">
          Alla barns poäng bidrar till familjens gemensamma mål. Ju fler
          uppgifter, desto snabbare når ni fram!
        </p>
      </div>
      <div className="space-y-4">
        {state.goals.map((g) => (
          <FamilyGoalCard key={g.id} goal={g} />
        ))}
      </div>
    </AppShell>
  );
}