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