import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TaskCard } from "@/components/task-card";
import { RewardCard } from "@/components/reward-card";
import {
  bestStreak,
  pointsThisWeek,
  pointsToday,
  tasksForChild,
  useFamily,
} from "@/lib/family-store";
import { COLOR_MAP, SLOT_LABEL } from "@/lib/family-types";
import type { RoutineSlot } from "@/lib/family-types";
import { ChildAvatar } from "@/components/child-avatar";
import { badgeStatuses } from "@/lib/badges";

export const Route = createFileRoute("/barn/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Barnvy – Vår Familj` },
      {
        name: "description",
        content: `Dagens uppgifter, poäng och belöningar för ${params.id}.`,
      },
    ],
  }),
  component: BarnPage,
});

function BarnPage() {
  const { id } = Route.useParams();
  const state = useFamily();
  const child = state.children.find((c) => c.id === id);
  const [tab, setTab] = useState<"uppgifter" | "beloningar" | "marken">(
    "uppgifter",
  );
  const [slot, setSlot] = useState<RoutineSlot>(() => {
    const h = new Date().getHours();
    if (h < 11) return "morgon";
    if (h < 17) return "dag";
    return "kvall";
  });

  const myTasks = useMemo(
    () => (child ? tasksForChild(state, child.id) : []),
    [state, child],
  );

  if (!child) {
    throw notFound();
  }

  const c = COLOR_MAP[child.color];
  const slotTasks = myTasks.filter((t) => t.slot === slot);
  const streak = bestStreak(child);
  const today = pointsToday(child);
  const week = pointsThisWeek(child);
  const myRewards = state.rewards.filter(
    (r) => r.childId === "all" || r.childId === child.id,
  );

  return (
    <AppShell>
      {/* Header card */}
      <section
        className={`${c.soft} ring-2 ${c.ring}/40 rounded-[32px] p-6 md:p-8`}
      >
        <div className="flex items-center gap-5 flex-wrap">
          <ChildAvatar child={child} size={128} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold uppercase tracking-widest ${c.text}`}>
              Din dag
            </p>
            <h2 className={`text-3xl md:text-4xl font-bold font-display ${c.text} truncate`}>
              Hej {child.name}!
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatChip label="Total" value={`${child.points} ⭐`} />
              <StatChip label="Idag" value={`+${today}`} />
              <StatChip label="Veckan" value={`+${week}`} />
              {streak > 0 && <StatChip label="Streak" value={`🔥 ${streak}`} />}
            </div>
          </div>
          <Link
            to="/"
            className="bg-white/80 hover:bg-white ring-1 ring-black/5 rounded-xl px-3 py-2 text-sm font-medium shrink-0"
          >
            ← Byt barn
          </Link>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <TabButton active={tab === "uppgifter"} onClick={() => setTab("uppgifter")}>
          🎯 Uppgifter
        </TabButton>
        <TabButton
          active={tab === "beloningar"}
          onClick={() => setTab("beloningar")}
        >
          🎁 Belöningar
        </TabButton>
        <TabButton active={tab === "marken"} onClick={() => setTab("marken")}>
          🏆 Märken
        </TabButton>
      </div>

      {tab === "uppgifter" && (
        <section className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {(["morgon", "dag", "kvall"] as RoutineSlot[]).map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`px-5 py-2 rounded-2xl font-semibold text-sm transition-all ${
                  slot === s
                    ? `${c.bg} text-white shadow-lg shadow-black/5`
                    : "bg-white ring-1 ring-black/5 text-zinc-500 hover:text-ink"
                }`}
              >
                {SLOT_LABEL[s]}
              </button>
            ))}
          </div>

          {slotTasks.length === 0 ? (
            <EmptyState
              emoji="🌈"
              title="Inga uppgifter här"
              body="Föräldrarna kan lägga till nya i föräldraläget."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {slotTasks.map((t) => (
                <TaskCard key={t.id} task={t} child={child} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "beloningar" && (
        <section className="space-y-6">
          <div className="flex items-end justify-between px-1">
            <h3 className="text-xl md:text-2xl font-semibold font-display">
              Dina belöningar
            </h3>
            <p className={`text-sm font-bold ${c.text}`}>
              {child.points} ⭐ att spendera
            </p>
          </div>
          {myRewards.length === 0 ? (
            <EmptyState
              emoji="🎁"
              title="Inga belöningar än"
              body="Föräldrarna kan skapa nya i föräldraläget."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myRewards.map((r) => (
                <RewardCard key={r.id} reward={r} child={child} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "marken" && (
        <section className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold font-display">
            Dina märken
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badgeStatuses(state, child).map((b) => (
              <div
                key={b.badge.id}
                className={`p-5 rounded-[24px] text-center space-y-2 ring-1 ${
                  b.unlocked
                    ? "bg-white ring-accent-strong/40"
                    : "bg-white/60 ring-black/5"
                }`}
              >
                <div
                  className={`text-6xl ${b.unlocked ? "" : "grayscale opacity-40"}`}
                >
                  {b.badge.emoji}
                </div>
                <p className="font-semibold font-display text-sm">
                  {b.badge.title}
                </p>
                {!b.unlocked && (
                  <p className="text-xs font-bold text-zinc-500">
                    {b.remaining} kvar
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/80 ring-1 ring-black/5 rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
        active
          ? "bg-ink text-white shadow-lg shadow-black/10"
          : "bg-white ring-1 ring-black/5 text-zinc-500 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-10 text-center space-y-2">
      <div className="text-5xl">{emoji}</div>
      <p className="font-semibold font-display text-lg">{title}</p>
      <p className="text-sm text-zinc-500">{body}</p>
    </div>
  );
}