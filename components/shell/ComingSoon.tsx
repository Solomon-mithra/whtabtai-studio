import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {
  name: string;
  blurb: string;
};

export function ComingSoon({ name, blurb }: Props) {
  return (
    <section className="paper-grain relative flex h-full w-full items-center justify-center bg-[color:var(--color-paper)] px-10">
      <div className="absolute left-3 top-3 z-20">
        <SidebarTrigger
          aria-label="Toggle navigation"
          title="Toggle navigation · ⌘B"
          className="text-[color:var(--color-ink)] hover:bg-[color:var(--color-rule-paper)] hover:text-[color:var(--color-signal)]"
        />
      </div>
      <div className="relative z-10 flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            What About AI
          </span>
          <span className="text-[color:var(--color-warm-dim)]">·</span>
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            {name}
          </span>
        </div>

        <h1 className="headline-tight font-display text-[72px] uppercase text-[color:var(--color-ink)]">
          {name}
        </h1>

        <p className="subtext-news max-w-md text-[15px] text-[color:var(--color-ink)]/70">
          {blurb}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-signal)]" />
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-ink)]/60">
            In progress · check back soon
          </span>
        </div>
      </div>
    </section>
  );
}
