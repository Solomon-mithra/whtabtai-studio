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
              sourceName={item.source_name}
            />
          )}
          <div className="flex h-full w-full flex-col overflow-hidden bg-[color:var(--color-paper)]">
            <Topbar />
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
