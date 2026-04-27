export const CATEGORIES = [
  "AI NEWS",
  "TOOL DROP",
  "QUICK TAKE",
  "BUILDER BREAKDOWN",
  "STARTUP WATCH",
  "META UPDATE",
  "OPENAI UPDATE",
  "GOOGLE AI",
  "ANTHROPIC",
  "WTF AI",
] as const;

export type Category = (typeof CATEGORIES)[number];
