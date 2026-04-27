import type { ReactNode } from "react";

export function Section({
  number,
  title,
  hint,
  children,
}: {
  number: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[color:var(--color-rule-soft)] px-7 py-7">
      <header className="mb-5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="num-tag">{number}</span>
          <h3 className="font-display text-[22px] uppercase tracking-[0.01em] text-[color:var(--color-warm)]">
            {title}
          </h3>
        </div>
        {hint ? (
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            {hint}
          </span>
        ) : null}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
