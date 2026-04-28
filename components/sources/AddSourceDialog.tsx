"use client";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSourceAction } from "@/app/sources/actions";
import type { SourceKind } from "@/lib/db/queries";

const KINDS: SourceKind[] = ["rss", "github_releases", "hn", "arxiv", "reddit"];

export function AddSourceDialog() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SourceKind>("rss");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function reset() {
    setUrl("");
    setName("");
    setError(null);
  }

  function submit() {
    setError(null);
    start(async () => {
      try {
        await addSourceAction(kind, url, name);
        setOpen(false);
        reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger render={<Button variant="outline">+ Add source</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SourceKind)}
            className="rounded border px-2 py-1 font-mono text-xs"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={kindHint(kind)} value={url} onChange={(e) => setUrl(e.target.value)} />
          {error && (
            <p className="font-mono text-[11px] text-red-600">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button disabled={!url || !name || pending} onClick={submit}>
            {pending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function kindHint(k: SourceKind) {
  return {
    rss: "https://example.com/feed.xml",
    github_releases: "owner/repo (e.g. anthropics/anthropic-sdk-python)",
    hn: "frontpage",
    arxiv: "cs.LG / cs.CL / cs.AI",
    reddit: "subreddit name without the r/",
  }[k];
}
