import { useState } from "react";
import type { Child, Task } from "@/lib/family-types";
import { COLOR_MAP } from "@/lib/family-types";
import { completeTask, isTaskDoneToday, isTaskPending } from "@/lib/family-store";
import { fireConfetti } from "@/lib/confetti";

export function TaskCard({ task, child }: { task: Task; child: Child }) {
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
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.value = 0.05;
        o.connect(g).connect(ctx.destination);
        o.start();
        o.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        o.stop(ctx.currentTime + 0.26);
      } catch {
        // ignore
      }
    }
  };

  if (done) {
    return (
      <div className="bg-zinc-50 ring-1 ring-black/5 p-6 rounded-[28px] flex flex-col gap-6 opacity-70">
        <div className="flex justify-between items-start">
          <div className="size-16 bg-white rounded-2xl ring-1 ring-black/5 grid place-items-center text-4xl">
            {task.emoji}
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            ✅ Klar
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-semibold font-display line-through text-zinc-500">
            {task.title}
          </h4>
          <p className="text-sm text-zinc-400">+{task.points} ⭐ intjänat</p>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="bg-amber-50 ring-1 ring-amber-200 p-6 rounded-[28px] flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="size-16 bg-white rounded-2xl ring-1 ring-black/5 grid place-items-center text-4xl">
            {task.emoji}
          </div>
          <div className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
            ⏳ Väntar
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-semibold font-display">{task.title}</h4>
          <p className="text-sm text-amber-700">Väntar på förälder</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handle}
      className={`text-left bg-card-soft ring-1 ring-black/5 p-6 rounded-[28px] flex flex-col gap-6 transition-transform hover:scale-[1.02] active:scale-[0.98] ${justDone ? "animate-pop-in" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div className="size-16 bg-white rounded-2xl ring-1 ring-black/5 grid place-items-center text-4xl shadow-sm">
          {task.emoji}
        </div>
        <div className={`${c.soft} ${c.text} px-3 py-1 rounded-full text-xs font-bold`}>
          +{task.points} ⭐
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-xl font-semibold font-display">{task.title}</h4>
        {task.requiresApproval && (
          <p className="text-xs text-zinc-500">Kräver godkännande</p>
        )}
      </div>
      <div
        className={`w-full py-4 ${c.bg} text-white rounded-2xl font-semibold text-lg text-center shadow-lg shadow-black/5`}
      >
        Klar!
      </div>
    </button>
  );
}