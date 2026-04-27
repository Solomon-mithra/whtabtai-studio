import type { InputHTMLAttributes } from "react";

export function EditorInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`dark-input w-full bg-transparent border-0 border-b border-[color:var(--color-rule-soft)] px-0 py-2 text-[14px] text-[color:var(--color-warm)] placeholder:text-[color:var(--color-warm-dim)] outline-none transition focus:border-[color:var(--color-signal)] ${props.className ?? ""}`}
    />
  );
}
