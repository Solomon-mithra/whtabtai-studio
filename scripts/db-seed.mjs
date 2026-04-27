#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);
const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, "..", "lib", "db", "seed", "sources.sql");
const body = readFileSync(file, "utf8");

// Neon's HTTP driver only accepts one statement per query. The seed file
// is a single multi-row INSERT, so we send it as one statement.
await sql.query(body.trim().replace(/;\s*$/, ""));
console.log("seeded");
