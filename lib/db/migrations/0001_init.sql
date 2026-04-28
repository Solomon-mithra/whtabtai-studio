create extension if not exists pgcrypto;

create table if not exists _migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('rss','github_releases','hn','arxiv','reddit')),
  url text not null,
  name text not null,
  enabled boolean not null default true,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  external_id text not null,
  title text not null,
  url text not null,
  summary text,
  content text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','saved','skipped','posted')),
  notes text not null default '',
  breaking_score int not null default 0 check (breaking_score between 0 and 3),
  trend_signature text,
  unique (source_id, external_id)
);

create index if not exists items_status_fetched_idx on items (status, fetched_at desc);
create index if not exists items_breaking_partial_idx on items (breaking_score desc) where breaking_score > 0;
create index if not exists items_trend_sig_partial_idx on items (trend_signature) where trend_signature is not null;

create table if not exists clusters (
  id uuid primary key default gen_random_uuid(),
  signature text not null,
  item_ids uuid[] not null,
  item_count int not null,
  window_start timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists clusters_window_idx on clusters (window_start desc);

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  auto_refresh_on_sources_open boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;
