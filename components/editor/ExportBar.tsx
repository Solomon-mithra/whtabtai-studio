"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Layers, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { StudioSlideOverride, useStudio } from "@/lib/store";
import { SIZES } from "@/lib/sizes";
import { exportNodeToPng, nodeToPngBlob, slugify } from "@/lib/export";
import { useCanvasRef } from "./CanvasRefContext";
import { TemplateA } from "@/components/templates/TemplateA";
import { TemplateB } from "@/components/templates/TemplateB";
import { TemplateC } from "@/components/templates/TemplateC";
import { TemplateD } from "@/components/templates/TemplateD";
import { GuideOverlay } from "./GuideOverlay";
import type { SlideState } from "@/lib/types";

function renderTemplate(key: SlideState["template"]) {
  switch (key) {
    case "A":
      return <TemplateA />;
    case "B":
      return <TemplateB />;
    case "C":
      return <TemplateC />;
    case "D":
      return <TemplateD />;
  }
}

function timestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 15);
}

export function ExportBar() {
  const s = useStudio();
  const sz = SIZES[s.size];
  const canvasRef = useCanvasRef();
  const [busy, setBusy] = useState<null | "single" | "all">(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const rigRef = useRef<HTMLDivElement>(null);

  async function onExportActive() {
    const node = canvasRef?.current;
    if (!node) return;
    setBusy("single");
    try {
      const fileName = `whtabtai_${s.template}_${slugify(s.headline)}_${sz.w}x${sz.h}_${timestamp()}.png`;
      await exportNodeToPng(node, sz.w, sz.h, fileName);
    } finally {
      setBusy(null);
    }
  }

  async function onExportAll() {
    setBusy("all");
    setProgress({ done: 0, total: s.slides.length });
    try {
      // Wait two animation frames so the off-screen rig has rendered all slides.
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );

      const rig = rigRef.current;
      if (!rig) return;

      const zip = new JSZip();
      const stamp = timestamp();
      const folder =
        zip.folder(`whtabtai_carousel_${sz.w}x${sz.h}_${stamp}`) ?? zip;

      for (let i = 0; i < s.slides.length; i++) {
        const slide = s.slides[i];
        const node = rig.querySelector<HTMLElement>(
          `[data-export-slide="${slide.id}"]`,
        );
        if (!node) continue;
        const blob = await nodeToPngBlob(node, sz.w, sz.h);
        const num = String(i + 1).padStart(2, "0");
        const name = `${num}_${slide.template}_${slugify(slide.headline)}.png`;
        folder.file(name, blob);
        setProgress({ done: i + 1, total: s.slides.length });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `whtabtai_carousel_${sz.w}x${sz.h}_${stamp}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  const isSingle = busy === "single";
  const isAll = busy === "all";

  return (
    <div className="border-t border-[color:var(--color-rule-soft)] bg-[color:var(--color-ink-2)] px-7 py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="num-tag">OUT</span>
        <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
          {s.slides.length === 1 ? "ready" : `${s.slides.length} slides`}
        </span>
      </div>

      <button
        type="button"
        disabled={busy !== null}
        onClick={onExportActive}
        className="group relative flex w-full items-center justify-between border border-[color:var(--color-warm)] bg-[color:var(--color-warm)] px-5 py-4 text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-signal)] hover:border-[color:var(--color-signal)] hover:text-[color:var(--color-warm)] disabled:opacity-60"
      >
        <div className="flex flex-col items-start">
          <span className="font-mono text-[10px] uppercase tracking-mono opacity-70">
            Export · slide {s.activeIndex + 1}
          </span>
          <span className="font-display text-[22px] uppercase leading-none">
            {isSingle ? "Rendering…" : "Save as PNG"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-mono opacity-70">
            {sz.w}×{sz.h}
          </span>
          {isSingle ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ArrowUpRight
              size={20}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          )}
        </div>
      </button>

      {s.slides.length > 1 && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={onExportAll}
          className="mt-2 group flex w-full items-center justify-between border border-[color:var(--color-rule-soft)] bg-transparent px-5 py-3 text-[color:var(--color-warm)] transition hover:border-[color:var(--color-signal)] hover:text-[color:var(--color-signal)] disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            {isAll ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Layers size={14} />
            )}
            <span className="font-mono text-[11px] uppercase tracking-mono">
              {isAll
                ? progress
                  ? `Exporting ${progress.done}/${progress.total}…`
                  : "Preparing…"
                : `Export all ${s.slides.length} as .zip`}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-mono opacity-60">
            .zip
          </span>
        </button>
      )}

      <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-[color:var(--color-warm-dim)]">
        Renders at full resolution. Saved locally — never uploaded.
      </p>

      {/* Off-screen rig: every slide rendered at full size for export-all.
          Mounted only while exporting all so we don't pay the layout cost otherwise. */}
      {isAll && (
        <div
          ref={rigRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 -z-50"
          style={{
            position: "fixed",
            left: -100000,
            top: 0,
            width: sz.w,
            height: sz.h,
          }}
        >
          {s.slides.map((slide) => (
            <StudioSlideOverride
              key={slide.id}
              slide={slide}
              size={s.size}
              fontSystem={s.fontSystem}
            >
              <div
                data-export-slide={slide.id}
                className="origin-top-left bg-white font-brand"
                style={{
                  width: sz.w,
                  height: sz.h,
                  position: "relative",
                }}
              >
                {renderTemplate(slide.template)}
                <GuideOverlay w={sz.w} h={sz.h} />
              </div>
            </StudioSlideOverride>
          ))}
        </div>
      )}
    </div>
  );
}
