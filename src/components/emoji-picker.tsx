import { useEffect, useRef, useState } from "react";

const GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Rutiner",
    emojis: "🦷 🛁 🚿 🧼 🧴 👕 👖 🧦 👟 🎒 🛏️ 😴 🌅 🌞 🌙 ⏰ 🧹 🧺 🗑️ 🍽️ 🍳 🥣 🥪 🍎 🥕 🥛 💧 💊 📚 ✏️ 📝 🎵 🎸 ⚽ 🚲 🐕 🐈 🌱 🪴 🚽 🧸".split(" "),
  },
  {
    label: "Barn",
    emojis: "👧 👦 🧒 👶 🧑 👩 👨 🦸 🦸‍♀️ 🦸‍♂️ 🧚 🧜 🧙 🐣 🐥 🦄 🐻 🐼 🐨 🐯 🦁 🐵 🐰 🦊 🐶 🐱 🐸 🐧 🐳 🦖".split(" "),
  },
  {
    label: "Belöningar",
    emojis: "🎁 🍦 🍫 🍬 🍭 🍪 🧁 🍕 🍔 🍿 🎮 📺 🎬 🎟️ 🏊 🎡 🎢 🎠 🛝 🧩 🪀 🎨 🖍️ 🚗 🛴 💰 💎 🕹️ 🏕️ 🍟".split(" "),
  },
  {
    label: "Mål & medaljer",
    emojis: "🏆 🥇 🥈 🥉 🎖️ 🏅 ⭐ 🌟 ✨ 💫 🔥 💪 ❤️ 💛 💚 💙 💜 🎯 🚀 🎉 🎊 🏰 🏡 🌈 ☀️ 🌻 🍀 👏 🤝 😊".split(" "),
  },
  {
    label: "Superkrafter",
    emojis: "🦁 🕊️ 🛡️ 🤗 🧘 ⚡ 🧠 👂 🫶 🙌 😌 🗣️ 🤲 🧩 🔆 🌊 🪄 🎈 🦋 🐢".split(" "),
  },
];

export function EmojiPicker({
  value,
  onChange,
  size = 48,
  className = "",
}: {
  value: string;
  onChange: (emoji: string) => void;
  size?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
        className="rounded-xl bg-card-soft grid place-items-center leading-none active:scale-95 transition-transform ring-1 ring-black/5"
        aria-label="Välj emoji"
      >
        <span>{value || "🙂"}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 w-[min(20rem,80vw)] max-h-72 overflow-y-auto bg-white rounded-2xl ring-1 ring-black/10 shadow-xl p-3 space-y-3">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {g.label}
              </p>
              <div className="grid grid-cols-7 gap-1">
                {g.emojis.map((e, i) => (
                  <button
                    key={`${g.label}-${i}-${e}`}
                    type="button"
                    onClick={() => {
                      onChange(e);
                      setOpen(false);
                    }}
                    className="size-9 rounded-lg text-2xl leading-none grid place-items-center hover:bg-card-soft active:scale-90 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
