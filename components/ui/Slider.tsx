"use client";

import { useId } from "react";

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (v: number) => string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex h-6 items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-px bg-[color:var(--color-rule-soft)]" />
        {/* Filled portion */}
        <div
          className="absolute left-0 h-px bg-[color:var(--color-signal)]"
          style={{ width: `${pct}%` }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((t) => (
          <div
            key={t}
            className="absolute h-1.5 w-px bg-[color:var(--color-warm-dim)] opacity-50"
            style={{ left: `calc(${t}% - 0.5px)`, top: "50%", marginTop: -3 }}
          />
        ))}
        {/* Native input on top */}
        <input
          id={id}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-input absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent"
        />
      </div>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
        <span>{min}</span>
        <span className="text-[color:var(--color-warm)]">
          {formatValue ? formatValue(value) : `${value}`}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}
