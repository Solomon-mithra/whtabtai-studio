export type SizeKey =
  | "ig-portrait"
  | "ig-square"
  | "ig-story"
  | "x-linkedin";

export type SizeDef = {
  key: SizeKey;
  label: string;
  short: string;
  w: number;
  h: number;
  hint: string;
};

export const SIZES: Record<SizeKey, SizeDef> = {
  "ig-portrait": {
    key: "ig-portrait",
    label: "Instagram Portrait",
    short: "IG · 4:5",
    w: 1080,
    h: 1350,
    hint: "1080×1350",
  },
  "ig-square": {
    key: "ig-square",
    label: "Instagram Feed",
    short: "IG · 1:1",
    w: 1080,
    h: 1080,
    hint: "1080×1080",
  },
  "ig-story": {
    key: "ig-story",
    label: "Story / Reel Cover",
    short: "STORY",
    w: 1080,
    h: 1920,
    hint: "1080×1920",
  },
  "x-linkedin": {
    key: "x-linkedin",
    label: "X / LinkedIn",
    short: "X · LI",
    w: 1600,
    h: 900,
    hint: "1600×900",
  },
};

export const SIZE_KEYS: SizeKey[] = [
  "ig-portrait",
  "ig-square",
  "ig-story",
  "x-linkedin",
];
