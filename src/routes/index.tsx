import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProfileCard } from "@/components/profile-card";
import { FamilyGoalCard } from "@/components/family-goal-card";
import { useFamily } from "@/lib/family-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vår Familj – Start" },
      {
        name: "description",
        content:
          "Familjens startsida. Se alla barn, dagens framsteg, poäng och familjemål på en och samma vy.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useFamily();
  const primaryGoal =
    state.goals
      .slice()
      .sort((a, b) => b.progress / b.target - a.progress / a.target)[0];

  return (
    <AppShell>
      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              God morgon 👋
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold font-display tracking-tight">
              Vem tar poäng idag?
            </h2>
          </div>
          <div className="hidden md:block text-sm text-zinc-500">
            Tryck på ett barn för att se dagens uppgifter
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {state.children.map((child) => (
            <ProfileCard key={child.id} child={child} state={state} />
          ))}
        </div>
      </section>

      {primaryGoal && <FamilyGoalCard goal={primaryGoal} />}

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold font-display px-1">
          Alla familjemål
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.goals.map((g) => (
            <div
              key={g.id}
              className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl">{g.emoji}</div>
                <span className="text-xs font-bold text-accent">
                  {g.progress}/{g.target}
                </span>
              </div>
              <p className="font-semibold font-display">{g.title}</p>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{
                    width: `${Math.min(100, (g.progress / g.target) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
