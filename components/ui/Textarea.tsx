import type { TextareaHTMLAttributes } from "react";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`dark-input w-full resize-none bg-transparent border border-[color:var(--color-rule-soft)] rounded-none px-3 py-2.5 text-[14px] leading-snug text-[color:var(--color-warm)] placeholder:text-[color:var(--color-warm-dim)] outline-none transition focus:border-[color:var(--color-signal)] ${props.className ?? ""}`}
    />
  );
}
