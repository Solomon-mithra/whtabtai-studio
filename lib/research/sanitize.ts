const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  let s = input;
  // Remove script/style blocks entirely (content + tags).
  s = s.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  // Drop all remaining tags.
  s = s.replace(/<[^>]+>/g, " ");
  // Decode common entities.
  s = s.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
  // Collapse whitespace.
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
