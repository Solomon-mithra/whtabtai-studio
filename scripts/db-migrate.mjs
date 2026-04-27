#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Put it in .env.local.");
  process.exit(1);
}

const sql = neon(url);
const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "lib", "db", "migrations");

await sql`create table if not exists _migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
)`;

const applied = new Set(
  (await sql`select filename from _migrations`).map((r) => r.filename),
);

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip   ${file}`);
    continue;
  }
  const body = readFileSync(join(migrationsDir, file), "utf8");
  console.log(`apply  ${file}`);
  // Neon's HTTP driver only accepts one statement per query. Split on `;`
  // — safe here because the migration files contain no `;` inside string
  // literals or dollar-quoted bodies.
  const statements = body
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const statement of statements) {
    await sql.query(statement);
  }
  await sql`insert into _migrations (filename) values (${file})`;
}
console.log("done");
