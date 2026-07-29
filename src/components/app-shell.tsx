import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { HouseUnlockCelebration } from "@/components/house-scene";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface font-sans text-ink pb-24 md:pb-0">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10 space-y-10">
        {children}
      </main>
      <BottomNav />
      <HouseUnlockCelebration />
    </div>
  );
}

function AppHeader() {
  return (
    <header className="py-4 md:py-6 px-4 md:px-8 lg:px-12 border-b border-zinc-950/5 bg-surface/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="size-12 shrink-0 bg-brand rounded-2xl grid place-items-center text-white text-2xl shadow-sm">
            🏠
          </div>
          <h1 className="text-xl md:text-2xl font-semibold font-display tracking-tight truncate">
            Vår Familj
          </h1>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-auto mr-2">
          {[
            { to: "/", icon: "🏠", label: "Hem" },
            { to: "/huset", icon: "🏰", label: "Huset" },
            { to: "/utmaningar", icon: "🏅", label: "Utmaningar" },
            { to: "/mal", icon: "🏆", label: "Mål" },
          ].map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-white"
              activeProps={{ className: "bg-white ring-1 ring-black/5 text-ink" }}
              activeOptions={{ exact: it.to === "/" }}
            >
              <span className="text-xl">{it.icon}</span>
              {it.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/foralder"
          className="flex items-center gap-2 bg-white ring-1 ring-black/5 py-2 px-3 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <span className="text-base">👨‍👩‍👧</span>
          <span className="hidden sm:inline">Föräldraläge</span>
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items: { to: string; icon: string; label: string; match: (p: string) => boolean }[] = [
    { to: "/", icon: "🏠", label: "Hem", match: (p) => p === "/" },
    { to: "/huset", icon: "🏰", label: "Huset", match: (p) => p.startsWith("/huset") },
    { to: "/utmaningar", icon: "🏅", label: "Medaljer", match: (p) => p.startsWith("/utmaningar") },
    { to: "/mal", icon: "🏆", label: "Mål", match: (p) => p.startsWith("/mal") },
    { to: "/foralder", icon: "⚙️", label: "Föräldrar", match: (p) => p.startsWith("/foralder") },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-zinc-950/5 px-3 py-3 md:hidden z-40">
      <div className="flex justify-around items-center">
        {items.map((it) => {
          const active = it.match(path);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-col items-center gap-1 ${active ? "text-brand" : "text-zinc-400"}`}
            >
              <span className="text-3xl leading-none">{it.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}