import { StudioProvider } from "@/lib/store";
import { CanvasRefProvider } from "@/components/editor/CanvasRefContext";
import { GuideProvider } from "@/components/editor/GuideContext";
import { Topbar } from "@/components/editor/Topbar";
import { Sidebar } from "@/components/editor/Sidebar";
import { Canvas } from "@/components/editor/Canvas";
import { UndoShortcuts } from "@/components/editor/UndoShortcuts";

export default function StudioPage() {
  return (
    <StudioProvider>
      <CanvasRefProvider>
        <GuideProvider>
          <UndoShortcuts />
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
