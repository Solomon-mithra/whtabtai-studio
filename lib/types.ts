import type { Category } from "./categories";
import type { SizeKey } from "./sizes";
import type { AccentKey } from "./brand";
import type { TemplateKey } from "./templates";
import type { FontSystemKey } from "./typography";
import type { ShadowState } from "./shadow";
import type { TextColorState } from "./textColor";
import type { HalftoneState } from "./halftone";
import type { Asset } from "./media";

export type ElementId =
  | "headline"
  | "subtext"
  | "badge"
  | "logo"
  | "image1"
  | "image2"
  | "arrow"
  | "footer"
  | "stripe"
  | "cta";

export type Offset = { x: number; y: number };
export type OffsetMap = Partial<Record<ElementId, Offset>>;

export type ImagePanId = "image1" | "image2";
export type ImagePanMap = Partial<Record<ImagePanId, Offset>>;

export type LineHeights = {
  headline: number;
  subtext: number;
};

export type ImageLayout = "grid" | "stack";

export type ImageBoxState = {
  heightMul: number; // 0.6 - 1.4, default 1.0
  /** Template A only: side-by-side ("grid") or one-above-the-other ("stack"). */
  layout?: ImageLayout;
};

/**
 * Per-slide content. Owned by a single carousel slide.
 * `size` and `fontSystem` live on the document so the carousel renders consistently.
 */
export type SlideState = {
  id: string;
  template: TemplateKey;
  category: Category;
  accent: AccentKey;
  headline: string;
  subtext: string;
  source: string;
  cta: string;
  image1: Asset | null;
  image2: Asset | null;
  offsets: OffsetMap;
  imagePan: ImagePanMap;
  textColor: TextColorState;
  shadow: ShadowState;
  lineHeights: LineHeights;
  imageBox: ImageBoxState;
  halftone: HalftoneState;
};

/**
 * Carousel-level document. `size` and `fontSystem` are shared across slides.
 */
export type DocumentState = {
  size: SizeKey;
  fontSystem: FontSystemKey;
  slides: SlideState[];
  activeId: string;
};

/**
 * Flattened view exposed by useStudio() — the active slide's fields
 * merged with the document-level shared fields. Existing consumers read
 * this shape unchanged.
 */
export type StudioState = Omit<SlideState, "id"> & {
  size: SizeKey;
  fontSystem: FontSystemKey;
};
