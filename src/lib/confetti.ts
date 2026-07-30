export function fireConfetti() {
  if (typeof document === "undefined") return;
  const colors = ["#0d9488", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6", "#10b981"];
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);
  const N = 80;
  for (let i = 0; i < N; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 8;
    el.style.cssText = `position:absolute;top:-10vh;left:${Math.random() * 100}vw;width:${size}px;height:${size * 0.4}px;background:${colors[i % colors.length]};border-radius:2px;animation:confetti-fall ${1.2 + Math.random() * 1.4}s cubic-bezier(0.3,0.7,0.4,1) forwards;animation-delay:${Math.random() * 0.3}s;transform:rotate(${Math.random() * 360}deg);`;
    container.appendChild(el);
  }
  setTimeout(() => container.remove(), 3000);
}

/** Stor konfettiregn – används vid dagens alla uppgifter klara. */
export function fireBigConfetti() {
  fireConfetti();
  setTimeout(fireConfetti, 250);
  setTimeout(fireConfetti, 600);
  setTimeout(fireConfetti, 1100);
}

/** Stjärnor och ringar som spretar ut från ett element. */
export function fireStarBurst(target: Element | null) {
  if (typeof document === "undefined" || !target) return;
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;";
  document.body.appendChild(container);

  const ring = document.createElement("div");
  ring.style.cssText = `position:absolute;left:${cx - 40}px;top:${cy - 40}px;width:80px;height:80px;border-radius:9999px;border:4px solid #f59e0b;animation:ring-burst 0.7s ease-out forwards;`;
  container.appendChild(ring);

  const icons = ["⭐", "✨", "🌟", "💫", "🎉"];
  for (let i = 0; i < 14; i++) {
    const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
    const dist = 90 + Math.random() * 90;
    const el = document.createElement("div");
    el.textContent = icons[i % icons.length];
    el.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;font-size:${18 + Math.random() * 18}px;--dx:${Math.cos(a) * dist}px;--dy:${Math.sin(a) * dist}px;animation:star-fly ${0.7 + Math.random() * 0.4}s cubic-bezier(0.2,0.7,0.3,1) forwards;`;
    container.appendChild(el);
  }
  setTimeout(() => container.remove(), 1600);
}