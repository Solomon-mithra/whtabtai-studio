"use client";

import { useRef, useState, type DragEvent } from "react";
import { fileToAsset, releaseAsset, type Asset } from "@/lib/media";

export function ImageDrop({
  value,
  onChange,
  label,
  aspect = "4 / 5",
}: {
  value: Asset | null;
  onChange: (value: Asset | null) => void;
  label: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const next = await fileToAsset(f);
      releaseAsset(value);
      onChange(next);
    } catch (err) {
      console.error("Failed to load asset:", err);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function onClear(e: React.MouseEvent) {
    e.stopPropagation();
    releaseAsset(value);
    onChange(null);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`group relative cursor-pointer overflow-hidden border transition ${
        over
          ? "border-[color:var(--color-signal)]"
          : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
      }`}
      style={{ aspectRatio: aspect }}
    >
      {value ? (
        <>
          {value.kind === "video" ? (
            <video
              src={value.url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.url}
              alt={label}
              className="h-full w-full object-cover"
            />
          )}
          {value.kind === "video" ? (
            <span className="absolute left-2 top-2 z-10 bg-[color:var(--color-ink)] px-2 py-1 font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-warm)]">
              Video
            </span>
          ) : null}
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 z-10 bg-[color:var(--color-ink)] px-2 py-1 font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-warm)] opacity-0 transition group-hover:opacity-100"
          >
            Replace
          </button>
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            {busy ? "Loading…" : over ? "Drop now" : "Drop or click"}
          </span>
          <span className="font-display text-[18px] uppercase text-[color:var(--color-warm)]">
            {label}
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-warm-dim)] opacity-60">
            png · jpg · webp · mp4 · mov · webm
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
