"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Guide } from "@/lib/snap";

type Ctx = {
  guides: Guide[];
  setGuides: (g: Guide[]) => void;
};

const GuideContext = createContext<Ctx | null>(null);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [guides, setGuidesState] = useState<Guide[]>([]);
  const setGuides = useCallback((g: Guide[]) => setGuidesState(g), []);
  const value = useMemo(() => ({ guides, setGuides }), [guides, setGuides]);
  return (
    <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
  );
}

export function useGuides() {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuides must be used inside GuideProvider");
  return ctx;
}
