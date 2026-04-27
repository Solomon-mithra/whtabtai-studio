import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="font-mono text-[10px] tracking-[0.04em] text-[color:var(--color-warm-dim)] opacity-70">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
