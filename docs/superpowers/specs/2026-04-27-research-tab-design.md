# Research Tab — Design Spec

**Date:** 2026-04-27
**Project:** whtabtai-studio
**Owner:** Solomon (@whtabtai)
**Status:** Approved by user, ready for planning

## Goal

Replace the `Research` "Coming Soon" stub with a working inbound-first hybrid feed reader that feeds the existing `Studio` post composer. The Research tab is the *input* layer of the @whtabtai content workflow; Studio is the *output* layer. Together they shorten the loop from "AI thing happened" to "post is published."

## Problem

For an AI news brand aimed at builders, the bottleneck is not finding signal — every brand has the same RSS feeds — it is **framing the signal into a builder-relevant angle**, and **doing it fast enough to ride the news cycle**. Today, Solomon does this across multiple tools (RSS reader, ChatGPT, Notion, then Studio). The Research tab consolidates discovery + triage + drafting into the same app as Studio.

## Non-goals (explicit YAGNI for v1)

- LLM features (auto-angle, auto-summary, semantic search). Future Phase 2.
- Authentication / multi-user. Single-user tool.
- Background ingestion / cron jobs. All ingestion is on-demand.
- Mobile layout polish. Desktop-first; primary use surface is Solomon's Mac.
- Storing the Postgres connection URL via the UI. Env var only for v1.
- Importing or migrating data from any prior tool.

## Top-level architecture

- Existing Next.js app at `whtabtai-studio/`. Project's `AGENTS.md` warns this is a non-stock Next.js — implementer must consult `node_modules/next/dist/docs/` for current APIs before writing route, server-action, or layout code.
- Three routes are populated in this scope:
  - `/research` — reading surface (replaces existing `ComingSoon` stub).
  - `/sources` — source management (replaces existing `ComingSoon` stub).
  - `/settings` — new route for user preferences.
- Persistence: Neon Postgres (free tier). Connection via `DATABASE_URL` env var. No connection-string-via-UI in v1.
- Ingestion: triggered exclusively by the user clicking "Refresh all" in the Sources tab. No background workers, no cron.
- All write paths use Next.js Server Actions; all read paths use server components or Server Actions returning data.

## Data model

Three tables, all in the default Neon database.

### `sources`

| column | type | notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `kind` | text | enum: `rss`, `github_releases`, `hn`, `arxiv`, `reddit` |
| `url` | text | feed URL, repo full_name (e.g. `anthropics/anthropic-sdk-python`), HN path, arXiv category, or subreddit name — interpretation depends on `kind` |
| `name` | text | display name in UI |
| `enabled` | boolean | default true |
| `last_fetched_at` | timestamptz nullable | updated when adapter succeeds |
| `created_at` | timestamptz | default now() |

### `items`

| column | type | notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `source_id` | uuid FK → sources.id | on delete cascade |
| `external_id` | text | adapter-defined dedup key, unique per source |
| `title` | text | |
| `url` | text | canonical link to the original |
| `summary` | text nullable | RSS description / GH release body excerpt / HN top comment etc. |
| `content` | text nullable | full content if cheap to fetch (e.g. RSS content:encoded); not aggressively scraped |
| `published_at` | timestamptz nullable | from the source |
| `fetched_at` | timestamptz | default now() |
| `status` | text | enum: `new`, `saved`, `skipped`, `posted`. Default `new` |
| `notes` | text | user notes / draft angle, default empty string |
| `breaking_score` | int | 0–3, see Smart Layer |
| `trend_signature` | text nullable | trigram-normalized title used for clustering |

Unique constraint: (`source_id`, `external_id`).
Indexes: `(status, fetched_at desc)`, `(breaking_score desc) where breaking_score > 0`, `(trend_signature) where trend_signature is not null`.

### `clusters`

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `signature` | text | shared trigram signature |
| `item_ids` | uuid[] | members |
| `item_count` | int | denormalized len(item_ids) |
| `window_start` | timestamptz | earliest member's fetched_at |
| `created_at` | timestamptz | default now() |

Clusters are recomputed at the end of every Refresh run (cheap because all data is in-process at that point). Old clusters whose `window_start` is older than 7 days may be garbage-collected on each Refresh.

### `settings`

Single-row table for user preferences. Inserted with defaults on first migration; updated in-place by the Settings UI.

| column | type | notes |
|---|---|---|
| `id` | int PK | hardcoded to 1 — `check (id = 1)` enforces single-row |
| `auto_refresh_on_sources_open` | boolean | default false |
| `updated_at` | timestamptz | default now() |

## Source ingestion

Each `kind` has an adapter that, given a `source` row, returns a list of normalized item candidates. The Refresh action calls every enabled source's adapter, dedups against existing `(source_id, external_id)` pairs, inserts new items with `status='new'`, then runs the smart layer over the newly inserted items plus any items inside the trending window.

### Adapter list (v1)

- **rss** — generic RSS / Atom parser. Handles lab blogs (Anthropic, OpenAI, Google AI, Mistral, HuggingFace) and any future Substack or blog the user adds. Uses a maintained Node parser library (e.g. `rss-parser`).
- **github_releases** — GitHub Releases API for a given `owner/repo`. Reads up to 50 most recent releases. Anonymous calls are fine for v1 free-tier rate limits; if exceeded, surface the error in the Sources row's last-fetch indicator.
- **hn** — Hacker News Algolia search API filtered for AI-relevant front-page items. Fetches top recent items, deduped by HN object_id.
- **arxiv** — arXiv API for given category (`cs.LG`, `cs.CL`, `cs.AI`). Most-recent listing, capped at 50 per refresh.
- **reddit** — Reddit JSON API (`/r/<subreddit>/new.json` and `/r/<subreddit>/hot.json`). User-Agent header set per Reddit API rules.

All adapters are pure async functions with type signature `(source: Source) => Promise<ItemCandidate[]>`. Errors per source are caught and surfaced in the Sources tab; one failing source does not abort the Refresh run.

### Seed source list (~15)

Inserted via a SQL seed file when the DB is first migrated. Editable from the Sources UI thereafter.

- RSS: Anthropic news, OpenAI blog, Google AI blog, Mistral blog, HuggingFace blog.
- github_releases: `anthropics/anthropic-sdk-python`, `openai/openai-python`, `langchain-ai/langchain`, `run-llama/llama_index`, `vllm-project/vllm`, `ollama/ollama`, `huggingface/transformers`, `ggerganov/llama.cpp`.
- hn: AI front-page filter (single source row).
- reddit: `LocalLLaMA`, `MachineLearning`.

arXiv categories are *not* in the seed; user can add via Sources UI if desired.

## Smart layer (deterministic, no LLM)

Both signals are computed at the end of every Refresh run, never on-demand at read time.

### Breaking-change radar

For each newly fetched item, compute `breaking_score: 0..3` by counting matches across title + summary + content of these patterns (case-insensitive):

- `\bbreaking\b`, `\bbreak(ing)? change\b`
- `\bdeprecat`
- `\bremoved\b`, `\bremoval\b`
- semver major bump — e.g. `v(\d+)\.0\.0` where it strictly follows a previous `v(\d-1).x.y` from the same source. **This rule applies to `github_releases` only** (the adapter has the prior release's tag in its fetched list); it is skipped for all other kinds.
- "price", "pricing", "cost" *only* when source kind is `rss` and source name contains a known lab (Anthropic / OpenAI / etc.) — heuristic to catch pricing changes from labs without spamming the radar from generic blogs.

Score is the count of distinct rules matched, capped at 3. Items with `breaking_score >= 1` get a "BREAKING" badge in the UI.

### Cross-signal trending

For each newly fetched item, compute `trend_signature` as: lowercase the title, strip stopwords + punctuation, take the sorted set of remaining word trigrams, hash to a stable string. (Trigram set, not n-gram concat, so word order doesn't matter.)

After all adapters run, group items fetched in the last 24h by `trend_signature` (with a fuzzy-match pass: signatures within Jaccard ≥ 0.6 collapse). Any group of size ≥ 3 becomes a `clusters` row. Items whose id appears in any cluster row get a "TRENDING" badge in the UI.

## UX

### Sources tab (`/sources`)

Replaces the current `ComingSoon` stub.

- Page header with "Refresh all" primary button. While refreshing, button shows spinner + per-source progress count ("4 / 15 done").
- After refresh, an alert summarizes: total new items, count of breaking, count of trending, any source errors.
- Table columns: name, kind, url, enabled toggle, last fetched (relative time), item count (lifetime — computed live as `count(items) where items.source_id = sources.id`; no denormalized counter).
- "Add source" → modal: kind selector (`rss` / `github_releases` / `hn` / `arxiv` / `reddit`), name field, url field. Validates URL format per kind on submit.
- Per-row delete (with confirm) and inline rename.

### Research tab (`/research`)

Replaces the current `ComingSoon` stub.

- Two-pane layout: left = item list (resizable, default ~360px), right = item detail.
- Top filter row: status filter chips (`All` / `New` / `Saved` / `Trending` / `Breaking`) and source dropdown. The `Trending` chip filters by membership in any active `clusters.item_ids`; this requires the read query to join (or `EXISTS`-check) against `clusters`. The `Breaking` chip filters by `items.breaking_score >= 1`.
- Sort menu: `Newest` (default) / `Trending first` / `Breaking first`.
- List item shows: title, source name, relative time, BREAKING / TRENDING badges if applicable, status indicator.
- Detail pane shows:
  - Title (linked to source URL).
  - Source meta: source name, kind icon, published_at + fetched_at.
  - Summary, then full content if available.
  - Notes textarea (autosaves on blur, 500ms debounce on type).
  - Status row: `New` / `Saved` / `Skipped` / `Posted` toggle.
  - "Send to Studio" button — primary action.

### Settings tab (`/settings`)

New route. Single page with grouped sections:

- **Refresh behavior** — toggle: "Auto-trigger refresh when I open Sources tab" (default off). That's the only toggle in v1.
- **Brand defaults for new posts** — placeholder section pointing to existing brand defaults; no editable fields in v1.
- **About** — DB connection status indicator (green = connected, red = error, with the error string). DB URL itself is not displayed.

### Side nav

Existing `SideNav` component already has Studio / Research / Sources / Library entries. Add a 5th entry for `Settings` (icon: `Settings` from lucide-react). Library remains untouched in this scope.

## Send-to-Studio handoff

- Clicking "Send to Studio" on an item:
  1. Sets the item's `status` to `posted`.
  2. Navigates to `/studio?from=research&itemId=<uuid>`.
- Studio reads the query params and, if `from=research`, fetches the item by id via a new server action and prefills a new draft with:
  - Headline = item.title (truncated to fit headline template).
  - Body = item.notes (the user's draft angle), or empty if notes are empty.
  - A small ribbon at the top of the editor: "From Research: <source name> · <published date>" with the source URL as a copy-link button.
- Studio's existing brand defaults (template, halftone background, Anton/Inter fonts) apply unchanged.
- The handoff is fire-and-forget: Research does not wait for confirmation that Studio created the post. The user can change their mind in Studio without rolling back the Research item's `posted` status; that's fine.

## Build order

This is the recommended order for the implementation plan. Each step is independently shippable to the dev server.

1. Schema migration + Neon connection setup + a seed SQL file with the seed source list.
2. Sources tab: list view, add-source modal, enable/disable toggle, delete.
3. RSS adapter + global "Refresh all" Server Action wired to the Sources tab button.
4. Research tab: list view + filter chips + sort menu (no detail pane yet).
5. Research tab: detail pane, notes autosave, status toggle.
6. Send-to-Studio handoff (Research side + Studio side).
7. Remaining adapters: github_releases, hn, arxiv, reddit.
8. Breaking-change radar (regex rules + scoring + UI badge).
9. Cross-signal trending (trigram + Jaccard clusterer + UI badge).
10. Settings tab.

## Open questions

None. All design decisions are locked.

## Risks

- **Reddit and HN APIs occasionally rate-limit or return errors.** Adapters must isolate failures so one bad source doesn't break a refresh.
- **GitHub anonymous rate limit (60 req/hr/IP)** could be exhausted if the user adds many GH repos and refreshes often. v1 surfaces the error; if it becomes a real problem, a Phase 2 can add an optional GH token in Settings.
- **Trigram clustering false positives** could group unrelated items with similar generic titles ("New release", "Open source"). The Jaccard threshold (0.6) is the tuning knob; revisit after first week of real use.
- **AGENTS.md says this Next.js has breaking changes from training-data-era Next.js.** Implementer must read the bundled docs before writing routes, server actions, or layout — do not ship code based on remembered Next.js APIs.

## Success criteria

- v1 ships when:
  - User can click "Refresh all" and see new items appear from all five adapter kinds.
  - User can save/skip an item and have it persist across refreshes.
  - User can write notes on an item and they autosave.
  - User can click "Send to Studio" and land in Studio with a prefilled draft.
  - Breaking and Trending badges appear on items that match their respective rules.
  - Sources can be added, renamed, disabled, and deleted from the UI.
  - Total ongoing service cost is $0.
