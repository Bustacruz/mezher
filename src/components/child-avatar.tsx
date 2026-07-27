import type { Child } from "@/lib/family-types";

export function ChildAvatar({
  child,
  size = 64,
  className = "",
}: {
  child: Pick<Child, "emoji" | "photoUrl" | "name">;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size } as const;
  if (child.photoUrl) {
    return (
      <img
        src={child.photoUrl}
        alt={child.name}
        style={style}
        className={`rounded-full object-cover bg-white shadow-sm ring-4 ring-white/70 ${className}`}
      />
    );
  }
  return (
    <div
      style={{ ...style, fontSize: Math.round(size * 0.55) }}
      className={`rounded-full bg-white grid place-items-center shadow-sm ring-4 ring-white/70 leading-none ${className}`}
    >
      <span>{child.emoji}</span>
    </div>
  );
}

export async function fileToCompressedDataUrl(
  file: File,
  maxSize = 512,
  quality = 0.85,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}