"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DocumentState,
  ElementId,
  ImagePanId,
  Offset,
  SlideState,
  StudioState,
} from "./types";
import { DEFAULT_HALFTONE } from "./halftone";
import type { SizeKey } from "./sizes";
import type { FontSystemKey } from "./typography";

const STORAGE_KEY = "whtabtai-studio:v6";
const LEGACY_STORAGE_KEY = "whtabtai-studio:v5";
const MAX_HISTORY = 50;
const TEXT_SQUASH_MS = 700;

const SHARED_FIELDS = ["size", "fontSystem"] as const satisfies readonly (keyof StudioState)[];
type SharedField = (typeof SHARED_FIELDS)[number];

const TEXT_FIELDS = ["headline", "subtext", "source", "cta"] as const satisfies readonly (keyof StudioState)[];
type TextField = (typeof TEXT_FIELDS)[number];

function isSharedField(key: keyof StudioState): key is SharedField {
  return (SHARED_FIELDS as readonly string[]).includes(key as string);
}
function isTextField(key: keyof StudioState): key is TextField {
  return (TEXT_FIELDS as readonly string[]).includes(key as string);
}

function newSlideId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const DEFAULT_SLIDE: Omit<SlideState, "id"> = {
  template: "A",
  category: "AI NEWS",
  accent: "none",
  headline: "Instagram is testing a new Snapchat-style app",
  subtext:
    "The app, called “Instants,” appears focused on private photo sharing with close friends.",
  source: "",
  cta: "Swipe →",
  image1: null,
  image2: null,
  offsets: {},
  imagePan: {},
  textColor: { mode: "default", custom: "#FF4A1C" },
  shadow: { color: "black", blur: 0, spread: 0, opacity: 75 },
  lineHeights: { headline: 1.0, subtext: 1.32 },
  imageBox: { heightMul: 1.0 },
  halftone: DEFAULT_HALFTONE,
};

export function makeSlide(partial: Partial<SlideState> = {}): SlideState {
  return {
    id: newSlideId(),
    ...DEFAULT_SLIDE,
    ...partial,
  };
}

const FIRST_SLIDE_ID = "s_initial";

export const DEFAULT_DOCUMENT: DocumentState = {
  size: "ig-portrait",
  fontSystem: "anton",
  slides: [{ id: FIRST_SLIDE_ID, ...DEFAULT_SLIDE }],
  activeId: FIRST_SLIDE_ID,
};

/** Migrate the v5 single-state shape into a one-slide v6 document. */
function migrateV5(parsed: Record<string, unknown>): DocumentState {
  const p = parsed as Partial<StudioState>;
  const slide: SlideState = {
    id: FIRST_SLIDE_ID,
    template: p.template ?? DEFAULT_SLIDE.template,
    category: p.category ?? DEFAULT_SLIDE.category,
    accent: p.accent ?? DEFAULT_SLIDE.accent,
    headline: p.headline ?? DEFAULT_SLIDE.headline,
    subtext: p.subtext ?? DEFAULT_SLIDE.subtext,
    source: p.source ?? DEFAULT_SLIDE.source,
    cta: p.cta ?? DEFAULT_SLIDE.cta,
    image1: p.image1 ?? null,
    image2: p.image2 ?? null,
    offsets: p.offsets ?? {},
    imagePan: p.imagePan ?? {},
    textColor: p.textColor ?? DEFAULT_SLIDE.textColor,
    shadow: p.shadow ?? DEFAULT_SLIDE.shadow,
    lineHeights: p.lineHeights ?? DEFAULT_SLIDE.lineHeights,
    imageBox: p.imageBox ?? DEFAULT_SLIDE.imageBox,
    halftone: p.halftone ?? DEFAULT_SLIDE.halftone,
  };
  return {
    size: p.size ?? DEFAULT_DOCUMENT.size,
    fontSystem: p.fontSystem ?? DEFAULT_DOCUMENT.fontSystem,
    slides: [slide],
    activeId: FIRST_SLIDE_ID,
  };
}

function reviveDocument(parsed: Partial<DocumentState>): DocumentState {
  const slides = (parsed.slides ?? []).map((s, i) => ({
    ...DEFAULT_SLIDE,
    ...s,
    id: s.id ?? (i === 0 ? FIRST_SLIDE_ID : newSlideId()),
    offsets: s.offsets ?? {},
    imagePan: s.imagePan ?? {},
  }));
  if (slides.length === 0) slides.push({ id: FIRST_SLIDE_ID, ...DEFAULT_SLIDE });
  const activeId = slides.find((s) => s.id === parsed.activeId)
    ? parsed.activeId!
    : slides[0].id;
  return {
    size: parsed.size ?? DEFAULT_DOCUMENT.size,
    fontSystem: parsed.fontSystem ?? DEFAULT_DOCUMENT.fontSystem,
    slides,
    activeId,
  };
}

type Shell = {
  current: DocumentState;
  past: DocumentState[];
  future: DocumentState[];
};

type StudioContextValue = StudioState & {
  setField: <K extends keyof StudioState>(key: K, value: StudioState[K]) => void;
  setOffset: (id: ElementId, value: Offset) => void;
  setImagePan: (id: ImagePanId, value: Offset) => void;
  beginDrag: () => void;
  endDrag: (moved: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetLayout: () => void;
  reset: () => void;

  slides: SlideState[];
  activeId: string;
  activeIndex: number;
  setActiveSlide: (id: string) => void;
  addSlideAfter: (id?: string) => void;
  addSlideBefore: (id?: string) => void;
  duplicateSlide: (id?: string) => void;
  deleteSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  hydrated: boolean;
};

const StudioContext = createContext<StudioContextValue | null>(null);

function pushPast(shell: Shell, snapshot: DocumentState): Shell {
  const past = [...shell.past, snapshot];
  if (past.length > MAX_HISTORY) past.shift();
  return { current: shell.current, past, future: [] };
}

function activeSlide(doc: DocumentState): SlideState {
  return doc.slides.find((s) => s.id === doc.activeId) ?? doc.slides[0];
}

function updateActiveSlide(
  doc: DocumentState,
  fn: (slide: SlideState) => SlideState,
): DocumentState {
  return {
    ...doc,
    slides: doc.slides.map((s) => (s.id === doc.activeId ? fn(s) : s)),
  };
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [shell, setShell] = useState<Shell>({
    current: DEFAULT_DOCUMENT,
    past: [],
    future: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const lastTextEdit = useRef<{
    field: keyof StudioState;
    slideId: string;
    time: number;
  } | null>(null);
  const dragSnapshot = useRef<DocumentState | null>(null);
  const shellRef = useRef(shell);
  useEffect(() => {
    shellRef.current = shell;
  }, [shell]);

  // Hydrate from localStorage. Tries v6 first, then migrates v5 if found.
  // The setShell calls run at most once on mount, so cascading-render concerns don't apply.
  useEffect(() => {
    try {
      const rawV6 = localStorage.getItem(STORAGE_KEY);
      if (rawV6) {
        const parsed = JSON.parse(rawV6) as Partial<DocumentState>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShell({ current: reviveDocument(parsed), past: [], future: [] });
      } else {
        const rawV5 = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (rawV5) {
          const parsed = JSON.parse(rawV5) as Record<string, unknown>;
          setShell({ current: migrateV5(parsed), past: [], future: [] });
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  const current = shell.current;
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {}
  }, [current, hydrated]);

  const setField = useCallback(
    <K extends keyof StudioState>(key: K, value: StudioState[K]) => {
      setShell((prev) => {
        const doc = prev.current;
        const isShared = isSharedField(key);
        const newDoc: DocumentState = isShared
          ? { ...doc, [key as SharedField]: value as DocumentState[SharedField] }
          : updateActiveSlide(doc, (s) => ({ ...s, [key]: value }) as SlideState);

        const isText = isTextField(key);
        const now = Date.now();
        const squash =
          isText &&
          lastTextEdit.current?.field === key &&
          lastTextEdit.current?.slideId === doc.activeId &&
          now - lastTextEdit.current.time < TEXT_SQUASH_MS;

        if (squash) {
          return { ...prev, current: newDoc, future: [] };
        }
        return { ...pushPast(prev, doc), current: newDoc };
      });
      if (isTextField(key)) {
        lastTextEdit.current = {
          field: key,
          slideId: shellRef.current.current.activeId,
          time: Date.now(),
        };
      } else {
        lastTextEdit.current = null;
      }
    },
    [],
  );

  const setOffset = useCallback((id: ElementId, value: Offset) => {
    setShell((prev) => ({
      ...prev,
      current: updateActiveSlide(prev.current, (s) => ({
        ...s,
        offsets: { ...s.offsets, [id]: value },
      })),
    }));
  }, []);

  const setImagePan = useCallback((id: ImagePanId, value: Offset) => {
    setShell((prev) => ({
      ...prev,
      current: updateActiveSlide(prev.current, (s) => ({
        ...s,
        imagePan: { ...s.imagePan, [id]: value },
      })),
    }));
  }, []);

  const beginDrag = useCallback(() => {
    setShell((prev) => {
      dragSnapshot.current = prev.current;
      return prev;
    });
  }, []);

  const endDrag = useCallback((moved: boolean) => {
    if (!moved || !dragSnapshot.current) {
      dragSnapshot.current = null;
      return;
    }
    const snap = dragSnapshot.current;
    setShell((prev) => ({ ...pushPast(prev, snap) }));
    dragSnapshot.current = null;
    lastTextEdit.current = null;
  }, []);

  const undo = useCallback(() => {
    setShell((prev) => {
      if (prev.past.length === 0) return prev;
      const last = prev.past[prev.past.length - 1];
      const future = [prev.current, ...prev.future].slice(0, MAX_HISTORY);
      return { current: last, past: prev.past.slice(0, -1), future };
    });
    lastTextEdit.current = null;
  }, []);

  const redo = useCallback(() => {
    setShell((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const past = [...prev.past, prev.current];
      if (past.length > MAX_HISTORY) past.shift();
      return { current: next, past, future: prev.future.slice(1) };
    });
    lastTextEdit.current = null;
  }, []);

  const resetLayout = useCallback(() => {
    setShell((prev) => ({
      ...pushPast(prev, prev.current),
      current: updateActiveSlide(prev.current, (s) => ({
        ...s,
        offsets: {},
        imagePan: {},
      })),
    }));
    lastTextEdit.current = null;
  }, []);

  const reset = useCallback(() => {
    setShell((prev) => ({
      ...pushPast(prev, prev.current),
      // Reset active slide content; preserve other slides + shared size/font.
      current: updateActiveSlide(prev.current, (s) => ({
        id: s.id,
        ...DEFAULT_SLIDE,
      })),
    }));
    lastTextEdit.current = null;
  }, []);

  // ── slide ops ────────────────────────────────────────────────────────
  const setActiveSlide = useCallback((id: string) => {
    setShell((prev) => {
      if (!prev.current.slides.find((s) => s.id === id)) return prev;
      if (prev.current.activeId === id) return prev;
      return {
        ...pushPast(prev, prev.current),
        current: { ...prev.current, activeId: id },
      };
    });
    lastTextEdit.current = null;
  }, []);

  const addSlideAt = useCallback((index: number, source?: SlideState) => {
    setShell((prev) => {
      const doc = prev.current;
      const fresh: SlideState = source
        ? { ...source, id: newSlideId() }
        : makeSlide();
      const slides = [
        ...doc.slides.slice(0, index),
        fresh,
        ...doc.slides.slice(index),
      ];
      return {
        ...pushPast(prev, doc),
        current: { ...doc, slides, activeId: fresh.id },
      };
    });
    lastTextEdit.current = null;
  }, []);

  const addSlideAfter = useCallback(
    (id?: string) => {
      const doc = shellRef.current.current;
      const target = id ?? doc.activeId;
      const i = doc.slides.findIndex((s) => s.id === target);
      addSlideAt(i < 0 ? doc.slides.length : i + 1);
    },
    [addSlideAt],
  );

  const addSlideBefore = useCallback(
    (id?: string) => {
      const doc = shellRef.current.current;
      const target = id ?? doc.activeId;
      const i = doc.slides.findIndex((s) => s.id === target);
      addSlideAt(i < 0 ? 0 : i);
    },
    [addSlideAt],
  );

  const duplicateSlide = useCallback(
    (id?: string) => {
      const doc = shellRef.current.current;
      const target = id ?? doc.activeId;
      const i = doc.slides.findIndex((s) => s.id === target);
      if (i < 0) return;
      addSlideAt(i + 1, doc.slides[i]);
    },
    [addSlideAt],
  );

  const deleteSlide = useCallback((id: string) => {
    setShell((prev) => {
      const doc = prev.current;
      if (doc.slides.length <= 1) return prev;
      const i = doc.slides.findIndex((s) => s.id === id);
      if (i < 0) return prev;
      const slides = doc.slides.filter((s) => s.id !== id);
      const nextActive =
        doc.activeId === id
          ? slides[Math.min(i, slides.length - 1)].id
          : doc.activeId;
      return {
        ...pushPast(prev, doc),
        current: { ...doc, slides, activeId: nextActive },
      };
    });
    lastTextEdit.current = null;
  }, []);

  const reorderSlides = useCallback(
    (fromIndex: number, toIndex: number) => {
      setShell((prev) => {
        const doc = prev.current;
        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= doc.slides.length ||
          toIndex >= doc.slides.length
        )
          return prev;
        const slides = [...doc.slides];
        const [moved] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, moved);
        return {
          ...pushPast(prev, doc),
          current: { ...doc, slides },
        };
      });
      lastTextEdit.current = null;
    },
    [],
  );

  const past = shell.past;
  const future = shell.future;
  const value = useMemo<StudioContextValue>(() => {
    const slide = activeSlide(current);
    const activeIndex = current.slides.findIndex((s) => s.id === slide.id);
    return {
      template: slide.template,
      size: current.size,
      category: slide.category,
      accent: slide.accent,
      headline: slide.headline,
      subtext: slide.subtext,
      source: slide.source,
      cta: slide.cta,
      image1: slide.image1,
      image2: slide.image2,
      offsets: slide.offsets,
      imagePan: slide.imagePan,
      fontSystem: current.fontSystem,
      textColor: slide.textColor,
      shadow: slide.shadow,
      lineHeights: slide.lineHeights,
      imageBox: slide.imageBox,
      halftone: slide.halftone,

      setField,
      setOffset,
      setImagePan,
      beginDrag,
      endDrag,
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      resetLayout,
      reset,

      slides: current.slides,
      activeId: current.activeId,
      activeIndex,
      setActiveSlide,
      addSlideAfter,
      addSlideBefore,
      duplicateSlide,
      deleteSlide,
      reorderSlides,

      hydrated,
    };
  }, [
    current,
    past,
    future,
    setField,
    setOffset,
    setImagePan,
    beginDrag,
    endDrag,
    undo,
    redo,
    resetLayout,
    reset,
    setActiveSlide,
    addSlideAfter,
    addSlideBefore,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
    hydrated,
  ]);

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

/**
 * Read-only studio context for off-screen renders of a non-active slide
 * (used by export-all). Setters are no-ops.
 */
export function StudioSlideOverride({
  slide,
  size,
  fontSystem,
  children,
}: {
  slide: SlideState;
  size: SizeKey;
  fontSystem: FontSystemKey;
  children: ReactNode;
}) {
  const value = useMemo<StudioContextValue>(() => {
    const noop = () => {};
    return {
      template: slide.template,
      size,
      category: slide.category,
      accent: slide.accent,
      headline: slide.headline,
      subtext: slide.subtext,
      source: slide.source,
      cta: slide.cta,
      image1: slide.image1,
      image2: slide.image2,
      offsets: slide.offsets,
      imagePan: slide.imagePan,
      fontSystem,
      textColor: slide.textColor,
      shadow: slide.shadow,
      lineHeights: slide.lineHeights,
      imageBox: slide.imageBox,
      halftone: slide.halftone,

      setField: noop,
      setOffset: noop,
      setImagePan: noop,
      beginDrag: noop,
      endDrag: noop,
      undo: noop,
      redo: noop,
      canUndo: false,
      canRedo: false,
      resetLayout: noop,
      reset: noop,

      slides: [slide],
      activeId: slide.id,
      activeIndex: 0,
      setActiveSlide: noop,
      addSlideAfter: noop,
      addSlideBefore: noop,
      duplicateSlide: noop,
      deleteSlide: noop,
      reorderSlides: noop,

      hydrated: true,
    };
  }, [slide, size, fontSystem]);
  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}
