"use client";
import { useEffect, useRef } from "react";
import { useStudio } from "@/lib/store";
import { markPosted } from "@/app/research/actions";

export function ResearchPrefill({
  itemId,
  title,
  notes,
  summary,
  sourceName,
}: {
  itemId: string;
  title: string;
  notes: string;
  summary: string | null;
  sourceName: string;
}) {
  const { hydrated, setField, addSlideAfter } = useStudio();
  const applied = useRef(false);

  useEffect(() => {
    if (!hydrated || applied.current) return;
    applied.current = true;
    // Don't clobber the user's current draft — push a new slide and prefill that.
    addSlideAfter();
    setField("headline", title.slice(0, 120));
    // Notes is the user's own take; prefer it. If empty, seed subtext from
    // the article summary so they have a starting draft instead of a blank.
    const subtextSeed = notes || (summary ? summary.slice(0, 280) : "");
    if (subtextSeed) setField("subtext", subtextSeed);
    setField("source", sourceName);
    void markPosted(itemId);
  }, [hydrated, itemId, title, notes, summary, sourceName, setField, addSlideAfter]);

  return null;
}
