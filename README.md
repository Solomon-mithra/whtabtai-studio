# What About AI? — Studio

The open-source workshop behind [@whtabtai](https://instagram.com/whtabtai), an AI news brand for builders.

This is the same tool I use to find stories, decide what's worth covering, and lay out every post that goes out. It's open so you can see exactly how the news gets made — what feeds it watches, how it ranks signal vs. noise, and what gets cut.

> **Status:** pre-1.0. Public-facing repo will land once the pipeline stabilizes and secrets are properly factored out. The code in `main` is the live tool — expect rough edges.

---

## Why this exists

Most AI news is either a press-release rewrite or a hot take with no provenance. I wanted a system where:

1. **Every post is traceable to a primary source.** No "according to reports" — the link is right there.
2. **The editorial filter is legible.** You can look at the code and see the heuristics that decide what's "breaking" and what's noise.
3. **The brand is reproducible.** Templates, typography, and palette are version-controlled, not locked in someone's Figma.

Open-sourcing the studio is the cleanest way to make all three real.

---

## How it works

The app is one Next.js project with three connected surfaces:

```
  Sources  ──►  Research  ──►  Studio  ──►  Export
   feeds       triaged          slide       PNG / MP4 /
   (RSS,        items           editor      ZIP carousel
   HN, arXiv,  with breaking
   GitHub,     scores
   Reddit)
```

### Sources (`/sources`)
A registry of feeds. Each row is a `kind` + URL: RSS, GitHub releases, Hacker News, arXiv categories, or a subreddit. Adapters live in [lib/research/adapters](lib/research/adapters/) — one file per source kind, all returning a normalized `Item`.

### Research (`/research`)
Pulls from every enabled source, dedupes against what's already in Postgres, and assigns a `breaking_score` (0–3) based on signal heuristics in [lib/research/breakingScore.ts](lib/research/breakingScore.ts). Items get marked `new`, `saved`, `skipped`, or `posted`. Clustering groups stories that are clearly the same news from different outlets.

### Studio (`/studio`)
A slide editor with four post templates:

- **A** — Two-screenshot news (side-by-side product shots)
- **B** — Single screenshot (one dominant image)
- **C** — Hot take (text-only quote card)
- **D** — Carousel cover (swipe-series title)

You can prefill the editor from any research item, drop in images or video clips, and ship the result.

### Export
- **Image posts** — rendered to PNG via [html-to-image](https://github.com/bubkoo/html-to-image).
- **Video posts** — composited in-browser with [ffmpeg.wasm](https://ffmpegwasm.netlify.app/).
- **Carousels** — bundled as a numbered ZIP via [jszip](https://stuk.github.io/jszip/).

No external rendering service. Everything happens in your browser or your own Postgres.

---

## Stack

- **Next.js 16** + **React 19** (App Router, server actions)
- **Tailwind 4** + **shadcn/ui** primitives, restyled with project tokens
- **Neon Postgres** via `@neondatabase/serverless` for sources, items, clusters, settings
- **dnd-kit** for sidebar reordering and slide tracks
- **ffmpeg.wasm** for client-side video export
- **TypeScript** throughout, no `any` in the editor core

Typography is locked: Anton for headlines, Inter for body. Palette and token logic live in [lib/brand.ts](lib/brand.ts).

---

## Getting started

```bash
# 1. Clone and install
npm install

# 2. Point at a Postgres (Neon free tier works)
cp .env.example .env.local
# fill in DATABASE_URL

# 3. Run migrations + seed default sources
npm run db:migrate
npm run db:seed

# 4. Boot the studio
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the studio. Add some feeds at `/sources`, hit refresh on `/research`, and you've got the same pipeline I use.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply SQL migrations in [lib/db/migrations](lib/db/migrations/) |
| `npm run db:seed` | Seed default sources |
| `npm test` | Run the Node test suite |
| `npm run lint` | ESLint |

---

## Pulling source video

The studio takes video clips as slide assets. Use this `yt-dlp` one-liner — it forces H.264 video + AAC audio in an mp4 container, which is exactly what Studio's upload accepts (no webm, no HEVC, no recoding):

```bash
brew install yt-dlp

yt-dlp -f "bv*[vcodec^=avc1]+ba[ext=m4a]/b[ext=mp4]" -o "video.mp4" "https://youtu.be/YOUR_ID"
```

Output is `video.mp4` in the current folder. Audio is preserved end-to-end — Studio's export pipeline maps it through to the final post render.

Always quote the URL — zsh treats `?` and `&` as glob characters and will refuse to run the command otherwise.

---

## Project layout

```
app/
  studio/        # editor surface (the canvas + sidebar)
  research/     # triage queue
  sources/      # feed registry
  library/      # post archive (coming soon)
components/
  editor/       # canvas, sidebar, export bar, drag/drop
  templates/    # A/B/C/D post layouts
  sources/      # add-source dialog, source rows
  ui/           # shadcn primitives
lib/
  brand.ts      # tokens, palette, typography rules
  research/     # adapters, dedup, breaking-score logic
  db/           # Neon client, queries, migrations
  videoExport.ts, halftone.ts, snap.ts, …
```


---

## Credits

Built by [@solomonmithra](https://x.com/solomonmithra). The brand the studio serves is [@whtabtai](https://instagram.com/whtabtai).
