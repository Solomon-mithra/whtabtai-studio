import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`dark-input w-full appearance-none bg-transparent border-0 border-b border-[color:var(--color-rule-soft)] rounded-none px-0 py-2 pr-8 text-[14px] text-[color:var(--color-warm)] outline-none transition focus:border-[color:var(--color-signal)] bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%2210%22%20viewBox=%220%200%2010%2010%22><path%20d=%22M2%204l3%203%203-3%22%20stroke=%22%23c8bfae%22%20stroke-width=%221.4%22%20fill=%22none%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/></svg>')] bg-[right_0_center] bg-no-repeat ${props.className ?? ""}`}
    />
  );
}
