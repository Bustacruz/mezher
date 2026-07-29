import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { FamilyGoalCard } from "@/components/family-goal-card";
import {
  bestStreak,
  completeTask,
  isTaskDoneToday,
  isTaskPending,
  progressToday,
  tasksForChild,
  useFamily,
} from "@/lib/family-store";
import { COLOR_MAP, SLOT_LABEL } from "@/lib/family-types";
import type { Child, RoutineSlot, Task } from "@/lib/family-types";
import { fireConfetti } from "@/lib/confetti";
import { ChildAvatar } from "@/components/child-avatar";
import { HouseScene } from "@/components/house-scene";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vår Familj – Start" },
      {
        name: "description",
        content:
          "Familjens startsida. Se alla barn sida vid sida med dagens uppgifter, poäng och familjemål på en och samma vy.",
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

  const cols =
    state.children.length <= 1
      ? "md:grid-cols-1"
      : state.children.length === 2
        ? "md:grid-cols-2"
        : state.children.length === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <AppShell>
      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              God morgon 👋
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold font-display tracking-tight">
              Dagens uppgifter för hela familjen
            </h2>
          </div>
          <div className="hidden md:block text-sm text-zinc-500">
            Bocka av direkt eller öppna ett barn för mer
          </div>
        </div>
        <div className={`grid grid-cols-1 ${cols} gap-4 md:gap-5`}>
          {state.children.map((child) => (
            <ChildColumn key={child.id} child={child} />
          ))}
        </div>
      </section>

      <HouseScene compact />

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
                <div className="text-6xl leading-none">{g.emoji}</div>
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

function ChildColumn({ child }: { child: Child }) {
  const state = useFamily();
  const c = COLOR_MAP[child.color];
  const streak = bestStreak(child);
  const { done, total } = progressToday(state, child.id);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const myTasks = tasksForChild(state, child.id);
  const slots: RoutineSlot[] = ["morgon", "dag", "kvall"];

  return (
    <div
      className={`${c.soft} ring-2 ${c.ring}/40 rounded-[28px] p-4 md:p-5 flex flex-col gap-4`}
    >
      <Link
        to="/barn/$id"
        params={{ id: child.id }}
        className="flex items-center gap-3 group"
      >
        <div className="relative shrink-0">
          <ChildAvatar child={child} size={112} className="ring-white/70" />
          {streak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-white ring-1 ring-black/5 px-2 py-1 rounded-full text-sm font-bold">
              🔥 {streak}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold font-display text-xl md:text-2xl ${c.text} truncate group-hover:underline`}
          >
            {child.name}
          </h3>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            {child.points} ⭐ · {done}/{total} klara
          </p>
          <div className="mt-1.5 w-full bg-white/70 h-1.5 rounded-full overflow-hidden">
            <div
              className={`${c.bg} h-full rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </Link>

      <div className="space-y-4">
        {slots.map((s) => {
          const list = myTasks.filter((t) => t.slot === s);
          if (list.length === 0) return null;
          return (
            <div key={s} className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 px-1">
                {SLOT_LABEL[s]}
              </p>
              <div className="space-y-2">
                {list.map((t) => (
                  <MiniTask key={t.id} task={t} child={child} />
                ))}
              </div>
            </div>
          );
        })}
        {myTasks.length === 0 && (
          <div className="bg-white/70 rounded-2xl p-4 text-center text-sm text-zinc-500">
            Inga uppgifter än
          </div>
        )}
      </div>
    </div>
  );
}

function MiniTask({ task, child }: { task: Task; child: Child }) {
  const [justDone, setJustDone] = useState(false);
  const done = isTaskDoneToday(task, child.id);
  const pending = isTaskPending(task, child.id);
  const c = COLOR_MAP[child.color];

  const handle = () => {
    if (done || pending) return;
    completeTask(task.id, child.id);
    if (!task.requiresApproval) {
      setJustDone(true);
      fireConfetti();
    }
  };

  const base =
    "w-full flex items-center gap-3 rounded-3xl p-3 text-left transition-transform active:scale-[0.98]";

  if (done) {
    return (
      <div className={`${base} bg-white/60 opacity-60`}>
        <div className="size-24 rounded-3xl bg-white grid place-items-center text-6xl leading-none shrink-0">
          {task.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold line-through text-zinc-500 truncate">
            {task.title}
          </p>
          <p className="text-xs text-zinc-400">+{task.points} ⭐</p>
        </div>
        <span className="text-4xl">✅</span>
      </div>
    );
  }

  if (pending) {
    return (
      <div className={`${base} bg-amber-50 ring-1 ring-amber-200`}>
        <div className="size-24 rounded-3xl bg-white grid place-items-center text-6xl leading-none shrink-0">
          {task.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{task.title}</p>
          <p className="text-xs text-amber-700">Väntar på förälder</p>
        </div>
        <span className="text-4xl">⏳</span>
      </div>
    );
  }

  return (
    <button
      onClick={handle}
      className={`${base} bg-white hover:bg-white ring-1 ring-black/5 shadow-sm ${justDone ? "animate-pop-in" : ""}`}
    >
      <div className="size-24 rounded-3xl bg-white ring-1 ring-black/5 grid place-items-center text-6xl leading-none shrink-0">
        {task.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{task.title}</p>
        <p className={`text-xs font-bold ${c.text}`}>+{task.points} ⭐</p>
      </div>
      <span
        className={`${c.bg} text-white text-2xl font-bold rounded-full size-14 grid place-items-center shrink-0 shadow`}
      >
        ✓
      </span>
    </button>
  );
}
