"use client";
import { useEffect, useRef } from "react";
import { useStudio } from "@/lib/store";
import { markPosted } from "@/app/research/actions";

export function ResearchPrefill({
  itemId,
  title,
  notes,
  sourceName,
}: {
  itemId: string;
  title: string;
  notes: string;
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
    if (notes) setField("subtext", notes);
    setField("source", sourceName);
    void markPosted(itemId);
  }, [hydrated, itemId, title, notes, sourceName, setField, addSlideAfter]);

  return null;
}
