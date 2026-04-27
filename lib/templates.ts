export type TemplateKey = "A" | "B" | "C" | "D";

export type TemplateDef = {
  key: TemplateKey;
  label: string;
  description: string;
  sub: string;
  needs: { image1: boolean; image2: boolean };
};

export const TEMPLATES: Record<TemplateKey, TemplateDef> = {
  A: {
    key: "A",
    label: "Two Screenshot News",
    description: "Side-by-side product shots with editorial headline.",
    sub: "Best for product leaks, feature reveals.",
    needs: { image1: true, image2: true },
  },
  B: {
    key: "B",
    label: "Single Screenshot",
    description: "One large product shot, dominant headline below.",
    sub: "Best for tool drops and single-app news.",
    needs: { image1: true, image2: false },
  },
  C: {
    key: "C",
    label: "Hot Take",
    description: "Big centered statement, no imagery required.",
    sub: "Best for opinions and quote cards.",
    needs: { image1: false, image2: false },
  },
  D: {
    key: "D",
    label: "Carousel Cover",
    description: "Category-led title cover for a swipe series.",
    sub: "Best for explainers and breakdowns.",
    needs: { image1: false, image2: false },
  },
};

export const TEMPLATE_KEYS: TemplateKey[] = ["A", "B", "C", "D"];
