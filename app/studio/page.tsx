import { StudioProvider } from "@/lib/store";
import { CanvasRefProvider } from "@/components/editor/CanvasRefContext";
import { GuideProvider } from "@/components/editor/GuideContext";
import { Topbar } from "@/components/editor/Topbar";
import { Sidebar } from "@/components/editor/Sidebar";
import { Canvas } from "@/components/editor/Canvas";
import { UndoShortcuts } from "@/components/editor/UndoShortcuts";
import { ResearchPrefill } from "@/components/editor/ResearchPrefill";
import { getItemDetail } from "@/lib/db/queries";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; itemId?: string }>;
}) {
  const params = await searchParams;
  const item =
    params.from === "research" && params.itemId
      ? await getItemDetail(params.itemId)
      : null;

  return (
    <StudioProvider>
      <CanvasRefProvider>
        <GuideProvider>
          <UndoShortcuts />
          {item && (
            <ResearchPrefill
              itemId={item.id}
              title={item.title}
              notes={item.notes}
              summary={item.summary}
              sourceName={item.source_name}
            />
          )}
          <div className="flex h-full w-full flex-col overflow-hidden bg-[color:var(--color-paper)]">
            <Topbar />
            {item && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border-b border-[color:var(--color-rule-paper)] bg-[color:var(--color-paper)] px-4 py-2 font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)] hover:text-[color:var(--color-signal)]"
                title="Open original in new tab"
              >
                <span>From research · {item.source_name}</span>
                <span className="truncate text-[color:var(--color-ink)]/60 normal-case tracking-normal">
                  {item.url}
                </span>
                <span className="ml-auto">↗</span>
              </a>
            )}
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <Canvas />
            </div>
          </div>
        </GuideProvider>
      </CanvasRefProvider>
    </StudioProvider>
  );
}
