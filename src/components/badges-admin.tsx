import { badgeStatuses, BADGE_METRIC_LABEL } from "@/lib/badges";
import { setBadgeProgress } from "@/lib/family-store";
import type { FamilyState } from "@/lib/family-types";
import { ChildAvatar } from "@/components/child-avatar";

export function MarkenTab({ state }: { state: FamilyState }) {
  return (
    <div className="space-y-8">
      {state.children.map((child) => {
        const rows = badgeStatuses(state, child);
        const unlockedCount = rows.filter((r) => r.unlocked).length;
        return (
          <section key={child.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <ChildAvatar child={child} size={56} />
              <div>
                <h3 className="text-xl font-semibold font-display">
                  {child.name}
                </h3>
                <p className="text-sm text-zinc-500 font-semibold">
                  {unlockedCount} av {rows.length} märken upplåsta
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((r) => (
                <div
                  key={r.badge.id}
                  className={`rounded-[24px] p-4 ring-1 space-y-3 ${
                    r.unlocked
                      ? "bg-white ring-accent-strong/40"
                      : "bg-white/70 ring-black/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-5xl ${r.unlocked ? "" : "grayscale opacity-40"}`}
                    >
                      {r.badge.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold font-display leading-tight">
                        {r.badge.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {r.badge.description}
                      </p>
                      <p className="text-[11px] uppercase tracking-widest text-zinc-400 mt-1">
                        {BADGE_METRIC_LABEL[r.badge.metric]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-3 rounded-full bg-accent-track overflow-hidden ring-1 ring-black/5">
                      <div
                        className="h-full rounded-full bg-accent-fill transition-all"
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold text-ink">
                      {r.value} / {r.badge.target}{" "}
                      {r.unlocked ? (
                        <span className="text-accent-strong">✓ Upplåst</span>
                      ) : (
                        <span className="text-zinc-500">
                          – {r.remaining} kvar
                        </span>
                      )}
                      {r.manual && (
                        <span className="ml-1 text-xs text-zinc-400">
                          (manuell, auto: {r.auto})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={r.value}
                      onChange={(e) =>
                        setBadgeProgress(
                          child.id,
                          r.badge.id,
                          Number(e.target.value),
                        )
                      }
                      className="w-20 rounded-xl ring-1 ring-black/10 px-3 py-2 text-sm font-semibold"
                      aria-label={`Progress för ${r.badge.title}`}
                    />
                    <button
                      onClick={() =>
                        setBadgeProgress(child.id, r.badge.id, r.badge.target)
                      }
                      className="px-3 py-2 rounded-xl bg-ink text-white text-sm font-semibold"
                    >
                      🔓 Lås upp
                    </button>
                    <button
                      onClick={() => setBadgeProgress(child.id, r.badge.id, 0)}
                      className="px-3 py-2 rounded-xl bg-white ring-1 ring-black/10 text-sm font-semibold"
                    >
                      🔒 Lås
                    </button>
                    {r.manual && (
                      <button
                        onClick={() =>
                          setBadgeProgress(child.id, r.badge.id, null)
                        }
                        className="px-3 py-2 rounded-xl text-sm font-semibold text-zinc-500"
                      >
                        ↩️ Auto
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
