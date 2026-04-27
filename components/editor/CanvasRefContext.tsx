"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type Ctx = {
  ref: RefObject<HTMLDivElement | null>;
  scale: number;
  setScale: (s: number) => void;
};

const CanvasContext = createContext<Ctx | null>(null);

export function CanvasRefProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  return (
    <CanvasContext.Provider value={{ ref, scale, setScale }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasRef() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvasRef must be used inside CanvasRefProvider");
  return ctx.ref;
}

export function useCanvasScale() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvasScale must be used inside CanvasRefProvider");
  return ctx.scale;
}

export function useCanvasSetScale() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvasSetScale must be used inside CanvasRefProvider");
  return ctx.setScale;
}
