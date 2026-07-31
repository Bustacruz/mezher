import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  addChild,
  addChallenge,
  addGoal,
  addReward,
  addTask,
  addHouseStars,
  approvePending,
  awardSuperpower,
  checkParentPin,
  completedToday,
  contributeToGoal,
  rejectPending,
  removeChallenge,
  removeChild,
  removeGoal,
  removeReward,
  removeSuperpowerAward,
  removeTask,
  resetHouse,
  resetProgress,
  setFamilyName,
  setHouseLevel,
  setParentPin,
  uncompleteTask,
  updateChallenge,
  updateChild,
  updateGoal,
  updateReward,
  useFamily,
} from "@/lib/family-store";
import type {
  Challenge,
  ChallengeMetric,
  ChallengePeriod,
  Frequency,
  KidColor,
  RoutineSlot,
} from "@/lib/family-types";
import { COLOR_MAP, METRIC_LABEL, PERIOD_LABEL, SLOT_LABEL } from "@/lib/family-types";
import { ChildAvatar, fileToCompressedDataUrl } from "@/components/child-avatar";

export const Route = createFileRoute("/foralder")({
  head: () => ({
    meta: [
      { title: "Föräldraläge – Vår Familj" },
      {
        name: "description",
        content:
          "Hantera barn, uppgifter, belöningar och godkännanden i föräldraläget.",
      },
    ],
  }),
  component: ForalderPage,
});

const COLORS: KidColor[] = ["pink", "blue", "amber", "violet", "green", "rose"];
const EMOJIS = ["👧", "🧒", "👦", "🧑", "🦄", "🐻", "🦊", "🐼", "🦁", "🐸"];

function ForalderPage() {
  const state = useFamily();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<
    | "barn"
    | "uppgifter"
    | "beloningar"
    | "godkann"
    | "angra"
    | "superkrafter"
    | "mal"
    | "huset"
    | "statistik"
    | "kod"
  >("barn");

  const pending = state.tasks.flatMap((t) =>
    t.pendingApproval.map((p) => ({ task: t, ...p })),
  );

  if (!unlocked) {
    return (
      <AppShell>
        <PinGate onUnlock={() => setUnlocked(true)} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-2 px-1">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          👨‍👩‍👧 Föräldraläge
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold font-display">
          Hantera familjen
        </h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            ["barn", "👶 Barn"],
            ["uppgifter", "🎯 Uppgifter"],
            ["beloningar", "🎁 Belöningar"],
            ["godkann", `✅ Godkänn${pending.length ? ` (${pending.length})` : ""}`],
            ["angra", "↩️ Ångra avbockning"],
            ["superkrafter", "🦸 Superkrafter"],
            ["mal", "🏆 Familjemål"],
            ["huset", "🏰 Huset"],
            ["statistik", "📊 Statistik"],
            ["kod", "🔒 Kod"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${
              tab === key
                ? "bg-ink text-white"
                : "bg-white ring-1 ring-black/5 text-zinc-500 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "barn" && <BarnTab state={state} />}
      {tab === "uppgifter" && <UppgifterTab state={state} />}
      {tab === "beloningar" && <BeloningarTab state={state} />}
      {tab === "godkann" && (
        <GodkannTab
          items={pending.map((p) => ({
            taskId: p.task.id,
            title: p.task.title,
            emoji: p.task.emoji,
            points: p.task.points,
            childId: p.childId,
            childName:
              state.children.find((c) => c.id === p.childId)?.name ?? "?",
          }))}
        />
      )}
      {tab === "mal" && <MalTab state={state} />}
      {tab === "angra" && <AngraTab state={state} />}
      {tab === "superkrafter" && <SuperkrafterTab state={state} />}
      {tab === "huset" && <HusetTab state={state} />}
      {tab === "kod" && <KodTab />}
      {tab === "statistik" && <StatistikTab state={state} />}

      <div className="pt-8 border-t border-zinc-950/5 flex flex-wrap gap-6">
        <button
          onClick={() => {
            if (
              confirm(
                "Nollställ barnens poäng och progress? Namn, bilder, uppgifter och belöningar behålls.",
              )
            ) {
              resetProgress();
            }
          }}
          className="text-xs text-zinc-400 hover:text-red-500 underline"
        >
          Nollställ barnens poäng &amp; progress
        </button>
        <button
          onClick={() => {
            if (confirm("Nollställ husets progress till nivå 0?")) resetHouse();
          }}
          className="text-xs text-zinc-400 hover:text-red-500 underline"
        >
          Nollställ husets progress
        </button>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold font-display px-1">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 block">
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const input =
  "w-full bg-white ring-1 ring-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand";

function BarnTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👧");
  const [color, setColor] = useState<KidColor>("violet");

  return (
    <div className="space-y-8">
      <Section title="Familjens namn">
        <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 flex items-center gap-3">
          <span className="text-5xl leading-none">🏡</span>
          <input
            value={state.familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Vår Familj"
            className={`${input} font-semibold text-lg`}
          />
        </div>
      </Section>
      <Section title="Barnprofiler">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.children.map((c) => (
            <ChildEditor key={c.id} childId={c.id} />
          ))}
        </div>
      </Section>

      <Section title="Lägg till nytt barn">
        <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 space-y-4">
          <Field label="Namn">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={input}
              placeholder="T.ex. Astrid"
            />
          </Field>
          <Field label="Avatar">
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`size-12 rounded-xl text-2xl grid place-items-center ring-1 ${
                    emoji === e
                      ? "ring-2 ring-brand bg-brand-light"
                      : "ring-black/10 bg-white"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Färg">
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => {
                const col = COLOR_MAP[c];
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`size-10 rounded-full ${col.bg} ring-4 ${
                      color === c ? "ring-black/20" : "ring-transparent"
                    }`}
                    aria-label={c}
                  />
                );
              })}
            </div>
          </Field>
          <button
            onClick={() => {
              if (!name.trim()) return;
              addChild({ name: name.trim(), emoji, color });
              setName("");
            }}
            className="bg-brand text-white font-semibold rounded-xl px-4 py-2.5 hover:bg-brand/90"
          >
            + Lägg till barn
          </button>
        </div>
      </Section>
    </div>
  );
}

function ChildEditor({ childId }: { childId: string }) {
  const state = useFamily();
  const child = state.children.find((c) => c.id === childId);
  if (!child) return null;
  const col = COLOR_MAP[child.color];

  const onPhoto = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await fileToCompressedDataUrl(file);
      updateChild(child.id, { photoUrl: url });
    } catch {
      alert("Kunde inte läsa bilden");
    }
  };

  return (
    <div
      className={`${col.soft} ring-1 ring-black/5 rounded-[24px] p-5 space-y-4`}
    >
      <div className="flex items-center gap-4">
        <ChildAvatar child={child} size={80} />
        <div className="flex-1 min-w-0 space-y-2">
          <input
            value={child.name}
            onChange={(e) => updateChild(child.id, { name: e.target.value })}
            className={`${input} font-semibold`}
            placeholder="Namn"
          />
          <p className="text-xs text-zinc-500">{child.points} ⭐ intjänade</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="cursor-pointer bg-white ring-1 ring-black/10 hover:ring-black/20 rounded-xl px-3 py-2 text-sm font-medium">
          📷 Ladda upp bild
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
        {child.photoUrl && (
          <button
            onClick={() => updateChild(child.id, { photoUrl: undefined })}
            className="bg-white ring-1 ring-black/10 rounded-xl px-3 py-2 text-sm text-zinc-500 hover:text-red-500"
          >
            Ta bort bild
          </button>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Emoji (används om ingen bild)
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => updateChild(child.id, { emoji: e })}
              className={`size-10 rounded-lg text-xl grid place-items-center ring-1 ${
                child.emoji === e
                  ? "ring-2 ring-brand bg-brand-light"
                  : "ring-black/10 bg-white"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Färg
        </p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((k) => {
            const cc = COLOR_MAP[k];
            return (
              <button
                key={k}
                onClick={() => updateChild(child.id, { color: k })}
                className={`size-8 rounded-full ${cc.bg} ring-4 ${
                  child.color === k ? "ring-black/20" : "ring-transparent"
                }`}
                aria-label={k}
              />
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm(`Ta bort ${child.name}?`)) removeChild(child.id);
        }}
        className="text-xs text-zinc-400 hover:text-red-500"
      >
        Ta bort barn
      </button>
    </div>
  );
}

function UppgifterTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [points, setPoints] = useState(10);
  const [slot, setSlot] = useState<RoutineSlot>("morgon");
  const [frequency, setFrequency] = useState<Frequency>("daglig");
  const [childId, setChildId] = useState<string>("all");
  const [requiresApproval, setRequiresApproval] = useState(false);

  return (
    <div className="space-y-8">
      <Section title="Alla uppgifter">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.tasks.map((t) => (
            <div
              key={t.id}
              className="bg-white ring-1 ring-black/5 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="size-12 rounded-xl bg-card-soft grid place-items-center text-2xl shrink-0">
                {t.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{t.title}</p>
                <p className="text-xs text-zinc-500">
                  {SLOT_LABEL[t.slot]} · {t.frequency} · +{t.points} ⭐
                  {t.requiresApproval && " · kräver godkännande"}
                </p>
              </div>
              <button
                onClick={() => removeTask(t.id)}
                className="text-xs text-zinc-400 hover:text-red-500 shrink-0"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skapa ny uppgift">
        <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Titel">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={input}
              placeholder="T.ex. Vattna blommor"
            />
          </Field>
          <Field label="Emoji">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className={input}
              maxLength={4}
            />
          </Field>
          <Field label="Poäng">
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              className={input}
              min={1}
            />
          </Field>
          <Field label="Tid på dagen">
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as RoutineSlot)}
              className={input}
            >
              <option value="morgon">Morgon</option>
              <option value="dag">Dag</option>
              <option value="kvall">Kväll</option>
            </select>
          </Field>
          <Field label="Frekvens">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className={input}
            >
              <option value="daglig">Daglig</option>
              <option value="veckovis">Veckovis</option>
              <option value="manatlig">Månatlig</option>
              <option value="engangs">Engångs</option>
            </select>
          </Field>
          <Field label="För vem">
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className={input}
            >
              <option value="all">Alla barn</option>
              {state.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="size-4 accent-brand"
            />
            Kräver föräldragodkännande innan poäng delas ut
          </label>
          <div className="md:col-span-2">
            <button
              onClick={() => {
                if (!title.trim()) return;
                addTask({
                  title: title.trim(),
                  emoji,
                  points,
                  slot,
                  frequency,
                  childId,
                  requiresApproval,
                });
                setTitle("");
              }}
              className="bg-brand text-white font-semibold rounded-xl px-4 py-2.5 hover:bg-brand/90"
            >
              + Lägg till uppgift
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function BeloningarTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const [cost, setCost] = useState(25);
  const [childId, setChildId] = useState<string>("all");

  return (
    <div className="space-y-8">
      <Section title="Alla belöningar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {state.rewards.map((r) => (
            <div
              key={r.id}
              className="bg-white ring-1 ring-black/5 rounded-2xl p-4 space-y-2"
            >
              <input
                value={r.emoji}
                maxLength={4}
                onChange={(e) => updateReward(r.id, { emoji: e.target.value })}
                className="w-full text-5xl text-center bg-card-soft rounded-xl py-2"
              />
              <input
                value={r.title}
                onChange={(e) => updateReward(r.id, { title: e.target.value })}
                className={`${input} font-semibold text-sm`}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={r.cost}
                  onChange={(e) =>
                    updateReward(r.id, { cost: parseInt(e.target.value) || 0 })
                  }
                  className={`${input} flex-1`}
                />
                <select
                  value={r.childId}
                  onChange={(e) =>
                    updateReward(r.id, { childId: e.target.value })
                  }
                  className={`${input} flex-1`}
                >
                  <option value="all">Alla</option>
                  {state.children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeReward(r.id)}
                className="text-[11px] text-zinc-400 hover:text-red-500"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skapa ny belöning">
        <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Titel">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={input}
            />
          </Field>
          <Field label="Emoji">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className={input}
              maxLength={4}
            />
          </Field>
          <Field label="Poäng">
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value) || 0)}
              className={input}
              min={1}
            />
          </Field>
          <Field label="För vem">
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className={input}
            >
              <option value="all">Alla barn</option>
              {state.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <button
              onClick={() => {
                if (!title.trim()) return;
                addReward({ title: title.trim(), emoji, cost, childId });
                setTitle("");
              }}
              className="bg-brand text-white font-semibold rounded-xl px-4 py-2.5 hover:bg-brand/90"
            >
              + Lägg till belöning
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function GodkannTab({
  items,
}: {
  items: {
    taskId: string;
    title: string;
    emoji: string;
    points: number;
    childId: string;
    childName: string;
  }[];
}) {
  if (items.length === 0) {
    return (
      <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-10 text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <p className="font-semibold font-display text-lg">Inget att godkänna</p>
        <p className="text-sm text-zinc-500">Alla uppgifter är hanterade.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div
          key={`${it.taskId}-${it.childId}`}
          className="bg-white ring-1 ring-black/5 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="size-12 rounded-xl bg-card-soft grid place-items-center text-2xl">
            {it.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{it.title}</p>
            <p className="text-xs text-zinc-500">
              {it.childName} · +{it.points} ⭐
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => rejectPending(it.taskId, it.childId)}
              className="px-3 py-2 rounded-xl bg-zinc-100 text-zinc-600 font-semibold text-sm"
            >
              Neka
            </button>
            <button
              onClick={() => approvePending(it.taskId, it.childId)}
              className="px-3 py-2 rounded-xl bg-green-500 text-white font-semibold text-sm"
            >
              ✅ Godkänn
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MalTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🏆");
  const [target, setTarget] = useState(500);

  return (
    <div className="space-y-8">
      <Section title="Alla familjemål">
        <div className="space-y-3">
          {state.goals.map((g) => (
            <div
              key={g.id}
              className="bg-white ring-1 ring-black/5 rounded-2xl p-4 flex flex-wrap items-center gap-3"
            >
              <input
                value={g.emoji}
                maxLength={4}
                onChange={(e) => updateGoal(g.id, { emoji: e.target.value })}
                className="size-14 text-3xl text-center bg-card-soft rounded-xl shrink-0"
              />
              <input
                value={g.title}
                onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                className={`${input} flex-1 min-w-40 font-semibold`}
              />
              <div className="flex items-center gap-2">
                <Field label="Klart">
                  <input
                    type="number"
                    value={g.progress}
                    onChange={(e) =>
                      updateGoal(g.id, { progress: parseInt(e.target.value) || 0 })
                    }
                    className={`${input} w-24`}
                  />
                </Field>
                <Field label="Mål">
                  <input
                    type="number"
                    value={g.target}
                    onChange={(e) =>
                      updateGoal(g.id, { target: parseInt(e.target.value) || 1 })
                    }
                    className={`${input} w-24`}
                  />
                </Field>
              </div>
              <button
                onClick={() => contributeToGoal(g.id, 50)}
                className="px-3 py-2 rounded-xl bg-accent text-white font-semibold text-xs shrink-0"
              >
                +50
              </button>
              <button
                onClick={() => removeGoal(g.id)}
                className="text-xs text-zinc-400 hover:text-red-500 shrink-0"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skapa nytt familjemål">
        <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Titel">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={input}
            />
          </Field>
          <Field label="Emoji">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className={input}
              maxLength={4}
            />
          </Field>
          <Field label="Målpoäng">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              className={input}
              min={1}
            />
          </Field>
          <div className="md:col-span-3">
            <button
              onClick={() => {
                if (!title.trim()) return;
                addGoal({ title: title.trim(), emoji, target });
                setTitle("");
              }}
              className="bg-brand text-white font-semibold rounded-xl px-4 py-2.5 hover:bg-brand/90"
            >
              + Lägg till familjemål
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function StatistikTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const totalDone = state.tasks.reduce(
    (s, t) => s + t.completedDates.length,
    0,
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatBox label="Familjens poäng" value={state.familyPoints} />
      <StatBox label="Antal barn" value={state.children.length} />
      <StatBox label="Uppgifter totalt" value={state.tasks.length} />
      <StatBox label="Genomförda" value={totalDone} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-[20px] p-5 space-y-1">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="text-3xl font-bold font-display text-brand">{value}</p>
    </div>
  );
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    const next = (pin + d).slice(0, 6);
    setPin(next);
    setError(false);
  };

  const submit = () => {
    if (checkParentPin(pin)) onUnlock();
    else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white ring-1 ring-black/5 rounded-[32px] p-8 space-y-6 text-center">
      <div className="text-7xl leading-none">🔒</div>
      <div>
        <h2 className="text-2xl font-semibold font-display">Föräldraläge</h2>
        <p className="text-sm text-zinc-500">Ange föräldrakoden</p>
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
          <span
            key={i}
            className={`size-4 rounded-full ${
              i < pin.length ? "bg-brand" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm font-semibold text-red-500">Fel kod, försök igen</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="bg-card-soft rounded-2xl py-4 text-2xl font-bold hover:bg-zinc-200"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setPin("")}
          className="bg-card-soft rounded-2xl py-4 text-xl"
        >
          ✖
        </button>
        <button
          onClick={() => press("0")}
          className="bg-card-soft rounded-2xl py-4 text-2xl font-bold hover:bg-zinc-200"
        >
          0
        </button>
        <button
          onClick={submit}
          className="bg-brand text-white rounded-2xl py-4 text-xl font-bold"
        >
          ✓
        </button>
      </div>
      <p className="text-[11px] text-zinc-400">Standardkod är 1234</p>
    </div>
  );
}

function KodTab() {
  const state = useFamily();
  const [pin, setPin] = useState(state.parentPin);
  const [saved, setSaved] = useState(false);

  return (
    <Section title="Föräldrakod">
      <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 space-y-4 max-w-sm">
        <Field label="Kod (4–6 siffror)">
          <input
            value={pin}
            inputMode="numeric"
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
              setSaved(false);
            }}
            className={input}
          />
        </Field>
        <button
          onClick={() => {
            if (pin.length < 4) return;
            setParentPin(pin);
            setSaved(true);
          }}
          className="bg-brand text-white font-semibold rounded-xl px-4 py-2.5"
        >
          Spara kod
        </button>
        {saved && <p className="text-sm text-green-600 font-semibold">Sparat ✅</p>}
      </div>
    </Section>
  );
}

function AngraTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const items = completedToday(state);
  if (items.length === 0) {
    return (
      <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-10 text-center space-y-2">
        <div className="text-6xl">🙌</div>
        <p className="font-semibold font-display text-lg">
          Inga avbockade uppgifter idag
        </p>
      </div>
    );
  }
  return (
    <Section title="Avbockat idag – tryck för att ångra">
      <div className="space-y-3">
        {items.map(({ task, childId }) => {
          const child = state.children.find((c) => c.id === childId);
          return (
            <div
              key={`${task.id}-${childId}`}
              className="bg-white ring-1 ring-black/5 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="size-16 rounded-2xl bg-card-soft grid place-items-center text-4xl">
                {task.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{task.title}</p>
                <p className="text-xs text-zinc-500">
                  {child?.name ?? "?"} · +{task.points} ⭐
                </p>
              </div>
              <button
                onClick={() => uncompleteTask(task.id, childId)}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-semibold text-sm hover:bg-red-50 hover:text-red-600 shrink-0"
              >
                ↩️ Ångra
              </button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function SuperkrafterTab({ state }: { state: ReturnType<typeof useFamily> }) {
  const [draft, setDraft] = useState<Omit<Challenge, "id">>({
    title: "",
    emoji: "🦸",
    description: "",
    childId: "all",
    metric: "karaktar",
    period: "manad",
    bronze: 1,
    silver: 3,
    gold: 6,
    awards: [],
  });

  return (
    <div className="space-y-8">
      <Section title="Ge en superkraft">
        <div className="space-y-3">
          {state.challenges.filter((c) => c.metric === "karaktar").length === 0 && (
            <p className="text-sm text-zinc-500">
              Skapa en superkraft med “Ges av förälder” nedan.
            </p>
          )}
          {state.challenges
            .filter((c) => c.metric === "karaktar")
            .map((ch) => (
              <div
                key={ch.id}
                className="bg-white ring-1 ring-black/5 rounded-2xl p-4 flex flex-wrap items-center gap-3"
              >
                <span className="text-5xl leading-none">{ch.emoji}</span>
                <div className="min-w-[8rem] flex-1">
                  <p className="font-semibold font-display">{ch.title}</p>
                  {ch.description && (
                    <p className="text-xs text-zinc-500">{ch.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.children
                    .filter((c) => ch.childId === "all" || ch.childId === c.id)
                    .map((c) => {
                      const count = (ch.awards ?? []).filter(
                        (a) => a.childId === c.id,
                      ).length;
                      return (
                        <div key={c.id} className="flex items-center gap-1">
                          <button
                            onClick={() => awardSuperpower(ch.id, c.id)}
                            className="px-3 py-2 rounded-xl bg-brand text-white font-semibold text-sm"
                          >
                            + {c.name}
                          </button>
                          <span className="text-xs font-bold text-zinc-500 w-6 text-center">
                            {count}
                          </span>
                          {count > 0 && (
                            <button
                              onClick={() => removeSuperpowerAward(ch.id, c.id)}
                              className="px-2 py-2 rounded-xl bg-zinc-100 text-zinc-500 text-sm"
                            >
                              −
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </Section>

      <Section title="Alla superkrafter">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.challenges.map((ch) => (
            <div
              key={ch.id}
              className="bg-white ring-1 ring-black/5 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <input
                  value={ch.emoji}
                  maxLength={4}
                  onChange={(e) =>
                    updateChallenge(ch.id, { emoji: e.target.value })
                  }
                  className="size-14 text-3xl text-center bg-card-soft rounded-xl"
                />
                <input
                  value={ch.title}
                  onChange={(e) =>
                    updateChallenge(ch.id, { title: e.target.value })
                  }
                  className={`${input} font-semibold`}
                />
              </div>
              <input
                value={ch.description ?? ""}
                placeholder="Beskrivning, t.ex. Du vågade prova nytt"
                onChange={(e) =>
                  updateChallenge(ch.id, { description: e.target.value })
                }
                className={input}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={ch.metric}
                  onChange={(e) =>
                    updateChallenge(ch.id, {
                      metric: e.target.value as ChallengeMetric,
                    })
                  }
                  className={input}
                >
                  {(["karaktar", "uppgifter", "poang", "streak"] as ChallengeMetric[]).map(
                    (m) => (
                      <option key={m} value={m}>
                        {METRIC_LABEL[m]}
                      </option>
                    ),
                  )}
                </select>
                <select
                  value={ch.period}
                  onChange={(e) =>
                    updateChallenge(ch.id, {
                      period: e.target.value as ChallengePeriod,
                    })
                  }
                  className={input}
                >
                  {(["vecka", "manad", "total"] as ChallengePeriod[]).map((p) => (
                    <option key={p} value={p}>
                      {PERIOD_LABEL[p]}
                    </option>
                  ))}
                </select>
                <select
                  value={ch.childId}
                  onChange={(e) =>
                    updateChallenge(ch.id, { childId: e.target.value })
                  }
                  className={`${input} col-span-2`}
                >
                  <option value="all">Alla barn</option>
                  {state.children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["bronze", "silver", "gold"] as const).map((k) => (
                  <Field
                    key={k}
                    label={k === "bronze" ? "🥉 Brons" : k === "silver" ? "🥈 Silver" : "🥇 Guld"}
                  >
                    <input
                      type="number"
                      value={ch[k]}
                      min={1}
                      onChange={(e) =>
                        updateChallenge(ch.id, {
                          [k]: parseInt(e.target.value) || 0,
                        } as Partial<Challenge>)
                      }
                      className={input}
                    />
                  </Field>
                ))}
              </div>
              <button
                onClick={() => removeChallenge(ch.id)}
                className="text-xs text-zinc-400 hover:text-red-500"
              >
                Ta bort superkraft
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skapa ny superkraft">
        <div className="bg-white ring-1 ring-black/5 rounded-[24px] p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Titel">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={input}
              placeholder="T.ex. Modig"
            />
          </Field>
          <Field label="Emoji">
            <input
              value={draft.emoji}
              maxLength={4}
              onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
              className={input}
            />
          </Field>
          <Field label="För vem">
            <select
              value={draft.childId}
              onChange={(e) => setDraft({ ...draft, childId: e.target.value })}
              className={input}
            >
              <option value="all">Alla barn</option>
              {state.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mäter">
            <select
              value={draft.metric}
              onChange={(e) =>
                setDraft({ ...draft, metric: e.target.value as ChallengeMetric })
              }
              className={input}
            >
              {(["karaktar", "uppgifter", "poang", "streak"] as ChallengeMetric[]).map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABEL[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Period">
            <select
              value={draft.period}
              onChange={(e) =>
                setDraft({ ...draft, period: e.target.value as ChallengePeriod })
              }
              className={input}
            >
              {(["vecka", "manad", "total"] as ChallengePeriod[]).map((p) => (
                <option key={p} value={p}>
                  {PERIOD_LABEL[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Beskrivning">
            <input
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={input}
              placeholder="Du vågade prova något nytt"
            />
          </Field>
          <Field label="🥉 Brons">
            <input
              type="number"
              value={draft.bronze}
              onChange={(e) =>
                setDraft({ ...draft, bronze: parseInt(e.target.value) || 0 })
              }
              className={input}
            />
          </Field>
          <Field label="🥈 Silver">
            <input
              type="number"
              value={draft.silver}
              onChange={(e) =>
                setDraft({ ...draft, silver: parseInt(e.target.value) || 0 })
              }
              className={input}
            />
          </Field>
          <Field label="🥇 Guld">
            <input
              type="number"
              value={draft.gold}
              onChange={(e) =>
                setDraft({ ...draft, gold: parseInt(e.target.value) || 0 })
              }
              className={input}
            />
          </Field>
          <div className="md:col-span-3">
            <button
              onClick={() => {
                if (!draft.title.trim()) return;
                addChallenge({ ...draft, title: draft.title.trim() });
                setDraft({ ...draft, title: "" });
              }}
              className="bg-brand text-white font-semibold rounded-xl px-4 py-2.5"
            >
              + Lägg till superkraft
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}