"use client";

import { useStudio } from "@/lib/store";
import { ACCENTS, type AccentKey } from "@/lib/brand";
import { CATEGORIES, type Category } from "@/lib/categories";
import { SIZES, SIZE_KEYS, type SizeKey } from "@/lib/sizes";
import { TEMPLATES, TEMPLATE_KEYS, type TemplateKey } from "@/lib/templates";
import {
  TEXT_COLOR_MODES,
  type TextColorMode,
} from "@/lib/textColor";
import { SHADOW_COLORS, type ShadowColor } from "@/lib/shadow";
import {
  HALFTONE_STYLES,
  randomizeHalftone,
  type HalftoneStyle,
} from "@/lib/halftone";
import { Field } from "@/components/ui/Field";
import { EditorInput as Input } from "@/components/ui/EditorInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Section } from "@/components/ui/Section";
import { Slider } from "@/components/ui/Slider";
import { ImageDrop } from "./ImageDrop";
import { ExportBar } from "./ExportBar";

export function Sidebar() {
  const s = useStudio();
  const tpl = TEMPLATES[s.template];
  const needsImage1 = tpl.needs.image1;
  const needsImage2 = tpl.needs.image2;

  return (
    <aside className="ink-grain relative flex h-full w-[400px] flex-none flex-col border-r border-[color:var(--color-rule)] bg-[color:var(--color-ink)] text-[color:var(--color-warm)]">
      {/* Identity strip */}
      <div className="flex items-baseline justify-between px-7 py-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            Studio · controls
          </div>
          <div className="mt-1 font-display text-[30px] uppercase leading-none tracking-tight">
            Compose the post
          </div>
        </div>
        <button
          type="button"
          onClick={s.reset}
          className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-signal)] transition"
        >
          Reset
        </button>
      </div>

      <div className="shell-scroll flex-1 overflow-y-auto pb-2">
        {/* 01 — Format */}
        <Section number="01" title="Format" hint="Template & size">
          <Field label="Template">
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_KEYS.map((k) => (
                <TemplateChip
                  key={k}
                  k={k}
                  active={s.template === k}
                  onClick={() => s.setField("template", k)}
                />
              ))}
            </div>
          </Field>

          <Field label="Output size">
            <div className="grid grid-cols-2 gap-2">
              {SIZE_KEYS.map((k) => (
                <SizeChip
                  key={k}
                  k={k}
                  active={s.size === k}
                  onClick={() => s.setField("size", k)}
                />
              ))}
            </div>
          </Field>
        </Section>

        {/* 02 — Taxonomy */}
        <Section number="02" title="Taxonomy" hint="Category & accent">
          <Field label="Category badge">
            <Select
              value={s.category}
              onChange={(e) =>
                s.setField("category", e.target.value as Category)
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Accent (use sparingly)" hint="Brand rule: 90% B&W, 10% accent">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
                const a = ACCENTS[k];
                const active = s.accent === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => s.setField("accent", k)}
                    className={`flex items-center gap-2 border px-2.5 py-1.5 transition ${
                      active
                        ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
                        : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
                    }`}
                    title={a.label}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: a.value,
                        outline:
                          k === "none"
                            ? "1px solid rgba(244,241,234,0.5)"
                            : "none",
                        outlineOffset: 1,
                      }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm)]">
                      {a.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
        </Section>

        {/* 03 — Copy */}
        <Section number="03" title="Copy" hint="Headline → subtext">
          <Field label="Headline">
            <Textarea
              rows={3}
              value={s.headline}
              onChange={(e) => s.setField("headline", e.target.value)}
              placeholder="What happened?"
            />
          </Field>
          <Field label="Subtext">
            <Textarea
              rows={3}
              value={s.subtext}
              onChange={(e) => s.setField("subtext", e.target.value)}
              placeholder="Why does it matter?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Source (optional)">
              <Input
                value={s.source}
                onChange={(e) => s.setField("source", e.target.value)}
                placeholder="Reported by …"
              />
            </Field>
            <Field label="CTA">
              <Input
                value={s.cta}
                onChange={(e) => s.setField("cta", e.target.value)}
                placeholder="Swipe →"
              />
            </Field>
          </div>

          <div className="border-t border-[color:var(--color-rule-soft)] pt-5 flex flex-col gap-5">
            <Field label="Headline line height" hint="Tight 0.85 · airy 1.30">
              <Slider
                value={s.lineHeights.headline}
                onChange={(v) =>
                  s.setField("lineHeights", {
                    ...s.lineHeights,
                    headline: v,
                  })
                }
                min={0.85}
                max={1.3}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <div className="mt-1 flex flex-wrap gap-1.5">
                {[0.9, 1.0, 1.1, 1.2].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      s.setField("lineHeights", {
                        ...s.lineHeights,
                        headline: v,
                      })
                    }
                    className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-mono transition ${
                      Math.abs(s.lineHeights.headline - v) < 0.005
                        ? "text-[color:var(--color-signal)]"
                        : "text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                    }`}
                  >
                    {v.toFixed(2)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Subtext line height" hint="Compact 1.10 · readable 1.50">
              <Slider
                value={s.lineHeights.subtext}
                onChange={(v) =>
                  s.setField("lineHeights", {
                    ...s.lineHeights,
                    subtext: v,
                  })
                }
                min={1.0}
                max={1.8}
                step={0.02}
                formatValue={(v) => v.toFixed(2)}
              />
              <div className="mt-1 flex flex-wrap gap-1.5">
                {[1.1, 1.32, 1.5, 1.7].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      s.setField("lineHeights", {
                        ...s.lineHeights,
                        subtext: v,
                      })
                    }
                    className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-mono transition ${
                      Math.abs(s.lineHeights.subtext - v) < 0.01
                        ? "text-[color:var(--color-signal)]"
                        : "text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                    }`}
                  >
                    {v.toFixed(2)}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Section>

        {/* 04 — Assets */}
        <Section
          number="04"
          title="Assets"
          hint={
            !needsImage1 && !needsImage2
              ? "no media for this template"
              : needsImage2
                ? "two slots · image or video"
                : "one slot · image or video"
          }
        >
          {needsImage1 || needsImage2 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {needsImage1 && (
                  <ImageDrop
                    label="Media 01"
                    aspect="4 / 5"
                    value={s.image1}
                    onChange={(v) => s.setField("image1", v)}
                  />
                )}
                {needsImage2 && (
                  <ImageDrop
                    label="Media 02"
                    aspect="4 / 5"
                    value={s.image2}
                    onChange={(v) => s.setField("image2", v)}
                  />
                )}
              </div>
              {s.template === "A" && needsImage1 && needsImage2 ? (
                <Field
                  label="Image layout"
                  hint="Side by side or stacked vertically."
                >
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: "grid", label: "Side by side" },
                        { key: "stack", label: "Stacked" },
                      ] as const
                    ).map((opt) => {
                      const active = (s.imageBox.layout ?? "grid") === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            s.setField("imageBox", {
                              ...s.imageBox,
                              layout: opt.key,
                            })
                          }
                          className={`flex items-center justify-center border px-2.5 py-2 font-mono text-[10px] uppercase tracking-mono transition ${
                            active
                              ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)] text-[color:var(--color-signal)]"
                              : "border-[color:var(--color-rule-soft)] text-[color:var(--color-warm-dim)] hover:border-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              ) : null}
              <Field
                label="Image height"
                hint="Resize the image canvas. Drag inside it to pan."
              >
                <Slider
                  value={s.imageBox.heightMul}
                  onChange={(v) =>
                    s.setField("imageBox", { ...s.imageBox, heightMul: v })
                  }
                  min={0.4}
                  max={2.5}
                  step={0.05}
                  formatValue={(v) => `${v.toFixed(2)}×`}
                />
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {[0.5, 1.0, 1.5, 2.0, 2.5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        s.setField("imageBox", { ...s.imageBox, heightMul: v })
                      }
                      className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-mono transition ${
                        Math.abs(s.imageBox.heightMul - v) < 0.025
                          ? "text-[color:var(--color-signal)]"
                          : "text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                      }`}
                    >
                      {v.toFixed(1)}×
                    </button>
                  ))}
                </div>
              </Field>
            </>
          ) : (
            <div className="border border-[color:var(--color-rule-soft)] px-4 py-6 text-center">
              <div className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
                No media required
              </div>
              <div className="mt-1 font-display text-[18px] uppercase text-[color:var(--color-warm)]">
                {tpl.label} is text-led
              </div>
            </div>
          )}
        </Section>

        {/* 05 — Text Color */}
        <Section
          number="05"
          title="Text color"
          hint="Headline, subtext, source"
        >
          <Field label="Mode">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TEXT_COLOR_MODES) as TextColorMode[]).map((k) => {
                const m = TEXT_COLOR_MODES[k];
                const active = s.textColor.mode === k;
                const swatch =
                  k === "default"
                    ? null
                    : k === "accent"
                      ? "var(--color-signal)"
                      : k === "custom"
                        ? s.textColor.custom
                        : m.sample;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      s.setField("textColor", { ...s.textColor, mode: k })
                    }
                    className={`flex items-center justify-center gap-2 border px-2 py-2 transition ${
                      active
                        ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
                        : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
                    }`}
                  >
                    {swatch ? (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          background: swatch,
                          outline:
                            (typeof swatch === "string" &&
                              swatch.toUpperCase() === "#FFFFFF") ||
                            swatch === m.sample
                              ? "1px solid rgba(244,241,234,0.45)"
                              : "none",
                          outlineOffset: 1,
                        }}
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #000 0 50%, #888 50% 100%)",
                          outline: "1px solid rgba(244,241,234,0.4)",
                          outlineOffset: 1,
                        }}
                      />
                    )}
                    <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm)]">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {s.textColor.mode === "custom" && (
            <Field label="Custom hex" hint="Subtext + source auto-dim from this">
              <div className="flex items-center gap-3">
                <label
                  className="relative flex h-9 w-12 flex-none cursor-pointer items-center justify-center border border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)] transition"
                  style={{ background: s.textColor.custom }}
                  title={s.textColor.custom}
                >
                  <input
                    type="color"
                    value={s.textColor.custom}
                    onChange={(e) =>
                      s.setField("textColor", {
                        ...s.textColor,
                        custom: e.target.value,
                      })
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
                <input
                  type="text"
                  value={s.textColor.custom}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (
                      /^#?[0-9a-fA-F]{0,6}$/.test(v) ||
                      v === ""
                    ) {
                      const hex = v.startsWith("#") ? v : `#${v}`;
                      s.setField("textColor", {
                        ...s.textColor,
                        custom: hex,
                      });
                    }
                  }}
                  placeholder="#FF4A1C"
                  spellCheck={false}
                  className="dark-input flex-1 bg-transparent border-0 border-b border-[color:var(--color-rule-soft)] px-0 py-2 font-mono text-[12px] uppercase tracking-[0.04em] text-[color:var(--color-warm)] outline-none transition focus:border-[color:var(--color-signal)]"
                />
              </div>
            </Field>
          )}
        </Section>

        {/* 06 — Drop Shadow */}
        <Section
          number="06"
          title="Drop shadow"
          hint="Headline & subtext"
        >
          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SHADOW_COLORS) as ShadowColor[]).map((k) => {
                const c = SHADOW_COLORS[k];
                const active = s.shadow.color === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      s.setField("shadow", { ...s.shadow, color: k })
                    }
                    title={c.label}
                    className={`flex items-center gap-2 border px-2.5 py-1.5 transition ${
                      active
                        ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
                        : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
                    }`}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          k === "accent" ? "var(--color-signal)" : c.hex,
                        outline:
                          c.hex.toUpperCase() === "#FFFFFF"
                            ? "1px solid rgba(244,241,234,0.4)"
                            : "none",
                        outlineOffset: 1,
                      }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm)]">
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Blur" hint="Soft edge fall-off">
            <Slider
              value={s.shadow.blur}
              onChange={(v) =>
                s.setField("shadow", { ...s.shadow, blur: v })
              }
              formatValue={(v) => `${v}`}
            />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {[0, 25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    s.setField("shadow", { ...s.shadow, blur: v })
                  }
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-mono transition ${
                    s.shadow.blur === v
                      ? "text-[color:var(--color-signal)]"
                      : "text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Spread"
            hint="Stacks layers — pushes the shadow outward, fully obscures whatever's behind"
          >
            <Slider
              value={s.shadow.spread}
              onChange={(v) =>
                s.setField("shadow", { ...s.shadow, spread: v })
              }
              formatValue={(v) => `${v}`}
            />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {[0, 25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    s.setField("shadow", { ...s.shadow, spread: v })
                  }
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-mono transition ${
                    s.shadow.spread === v
                      ? "text-[color:var(--color-signal)]"
                      : "text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Opacity" hint="Per-layer alpha; spread compounds it">
            <Slider
              value={s.shadow.opacity}
              onChange={(v) =>
                s.setField("shadow", { ...s.shadow, opacity: v })
              }
              formatValue={(v) => `${v}%`}
            />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {[0, 25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    s.setField("shadow", { ...s.shadow, opacity: v })
                  }
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-mono transition ${
                    s.shadow.opacity === v
                      ? "text-[color:var(--color-signal)]"
                      : "text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-warm)]"
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* 07 — Background */}
        <Section
          number="07"
          title="Background"
          hint="Halftone field · randomizable"
        >
          <Field
            label="Pattern"
            hint="Off keeps the white paper. Randomize spins a fresh field."
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  s.setField("halftone", {
                    ...s.halftone,
                    enabled: !s.halftone.enabled,
                  })
                }
                className={`flex items-center gap-2 border px-3 py-1.5 transition ${
                  s.halftone.enabled
                    ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
                    : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: s.halftone.enabled
                      ? "var(--color-signal)"
                      : "var(--color-warm-dim)",
                  }}
                />
                <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm)]">
                  {s.halftone.enabled ? "On" : "Off"}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  s.setField("halftone", randomizeHalftone(s.halftone))
                }
                className="flex-1 border border-[color:var(--color-rule-soft)] bg-[color:var(--color-warm)]/5 px-3 py-1.5 text-center font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm)] hover:border-[color:var(--color-signal)] hover:text-[color:var(--color-signal)] transition"
              >
                ⟳ Randomize
              </button>
            </div>
          </Field>

          <Field label="Style">
            <div className="grid grid-cols-4 gap-2">
              {HALFTONE_STYLES.map((k) => {
                const active = s.halftone.style === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      s.setField("halftone", {
                        ...s.halftone,
                        style: k as HalftoneStyle,
                        enabled: true,
                      })
                    }
                    className={`border px-2 py-2 text-center transition ${
                      active
                        ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
                        : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm)]">
                      {k}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Density" hint="Higher = more dots fill in">
            <Slider
              value={s.halftone.density}
              onChange={(v) =>
                s.setField("halftone", { ...s.halftone, density: v })
              }
              min={0.15}
              max={1}
              step={0.01}
              formatValue={(v) => v.toFixed(2)}
            />
          </Field>

          <Field label="Cell size" hint="Pixels between dots">
            <Slider
              value={s.halftone.cell}
              onChange={(v) =>
                s.setField("halftone", { ...s.halftone, cell: v })
              }
              min={10}
              max={50}
              step={1}
              formatValue={(v) => `${v}px`}
            />
          </Field>

          <Field label="Rotation" hint="Tilts the whole field">
            <Slider
              value={s.halftone.rotation}
              onChange={(v) =>
                s.setField("halftone", { ...s.halftone, rotation: v })
              }
              min={-90}
              max={90}
              step={1}
              formatValue={(v) => `${v}°`}
            />
          </Field>

          <Field label="Opacity">
            <Slider
              value={Math.round(s.halftone.opacity * 100)}
              onChange={(v) =>
                s.setField("halftone", {
                  ...s.halftone,
                  opacity: v / 100,
                })
              }
              min={5}
              max={100}
              step={1}
              formatValue={(v) => `${v}%`}
            />
          </Field>

          <Field label="Color" hint="Default suits the template">
            <div className="flex items-center gap-3">
              <label
                className="relative flex h-9 w-12 flex-none cursor-pointer items-center justify-center border border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)] transition"
                style={{ background: s.halftone.color }}
                title={s.halftone.color}
              >
                <input
                  type="color"
                  value={s.halftone.color}
                  onChange={(e) =>
                    s.setField("halftone", {
                      ...s.halftone,
                      color: e.target.value,
                    })
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["#000000", "#FFFFFF", "#2563EB", "#22C55E", "#EF4444", "#8B5CF6"].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        s.setField("halftone", { ...s.halftone, color: c })
                      }
                      className={`h-6 w-6 border ${
                        s.halftone.color.toLowerCase() === c.toLowerCase()
                          ? "border-[color:var(--color-signal)]"
                          : "border-[color:var(--color-rule-soft)]"
                      }`}
                      style={{ background: c }}
                      aria-label={c}
                    />
                  ),
                )}
              </div>
            </div>
          </Field>
        </Section>
      </div>

      <ExportBar />
    </aside>
  );
}

function TemplateChip({
  k,
  active,
  onClick,
}: {
  k: TemplateKey;
  active: boolean;
  onClick: () => void;
}) {
  const t = TEMPLATES[k];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 border px-3 py-2.5 text-left transition ${
        active
          ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
          : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
        Template {t.key}
      </span>
      <span className="font-display text-[16px] uppercase leading-tight text-[color:var(--color-warm)]">
        {t.label}
      </span>
    </button>
  );
}

function SizeChip({
  k,
  active,
  onClick,
}: {
  k: SizeKey;
  active: boolean;
  onClick: () => void;
}) {
  const sz = SIZES[k];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 border px-3 py-2.5 text-left transition ${
        active
          ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal-soft)]"
          : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
        {sz.short}
      </span>
      <span className="font-mono text-[12px] text-[color:var(--color-warm)]">
        {sz.hint}
      </span>
    </button>
  );
}
