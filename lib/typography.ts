/**
 * Single project-wide font system: Anton for headlines, Inter for body.
 * No other fonts are loaded. The `fontSystem` field in StudioState is kept
 * for forwards-compatibility but only ever resolves to "anton".
 */
export type FontSystemKey = "anton";

export type FontSystemDef = {
  key: FontSystemKey;
  label: string;
  preview: string;
  note: string;
  display: { var: string; weight: number; tracking: number; lineHeight: number };
  body: { var: string; weight: number };
  badge: { var: string; weight: number; tracking: number };
};

export const FONT_SYSTEMS: Record<FontSystemKey, FontSystemDef> = {
  anton: {
    key: "anton",
    label: "Anton + Inter",
    preview: "Anton",
    note: "Brand · Anton headlines, Inter body",
    display: {
      var: "var(--font-anton)",
      weight: 400,
      tracking: -0.005,
      lineHeight: 0.92,
    },
    body: { var: "var(--font-inter)", weight: 500 },
    badge: { var: "var(--font-inter)", weight: 600, tracking: 0.08 },
  },
};

export const FONT_SYSTEM_KEYS: FontSystemKey[] = ["anton"];
