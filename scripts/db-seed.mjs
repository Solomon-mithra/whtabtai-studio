#!/usr/bin/env node
import { readFileSync } from "node:fs";
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
const file = join(here, "..", "lib", "db", "seed", "sources.sql");
const body = readFileSync(file, "utf8");

// Neon's HTTP driver only accepts one statement per query. Split on `;` so
// the file can contain multiple statements. Naive split — a future seed file
// with `;` inside a string literal or dollar-quoted body will need a smarter
// splitter. Each statement must be individually safe to re-run, since there
// is no per-file transaction.
const statements = body
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  await sql.query(stmt);
}
console.log(`seeded (${statements.length} statement${statements.length === 1 ? "" : "s"})`);
