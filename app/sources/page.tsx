import { listSources } from "@/lib/db/queries";
import { SourceRow } from "@/components/sources/SourceRow";
import { SourcesToolbar } from "./SourcesClient";

export default async function SourcesPage() {
  const sources = await listSources();
  return (
    <section className="paper-grain h-full w-full overflow-auto bg-[color:var(--color-paper)] px-10 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[40px] uppercase tracking-tight text-[color:var(--color-ink)]">
          Sources
        </h1>
        <SourcesToolbar />
      </header>
      <div className="rounded-md border border-[color:var(--color-rule-paper)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[color:var(--color-rule-paper)] font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Kind</th>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2">Enabled</th>
              <th className="px-4 py-2">Last fetched</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <SourceRow key={s.id} source={s} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
