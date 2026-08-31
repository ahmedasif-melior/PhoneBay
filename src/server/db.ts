import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seedIfEmpty } from "@/server/seed";
// A small, dependency-free persistence layer built on Node's built-in
// SQLite driver (node:sqlite, stable since Node 22). No native bindings,
// no external binary downloads — works identically in dev, CI, and
// production containers.
//
// The database file lives in /data/phonebay.db (gitignored). Schema is
// applied idempotently from schema.sql on first import in a process.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "phonebay.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "server", "schema.sql");

declare global {
  // eslint-disable-next-line no-var
  var __phonebayDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA busy_timeout = 5000;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  database.exec(schema);

  return database;
}

// Reuse a single connection across hot-reloads in dev (Next.js re-evaluates
// modules on every request in dev mode without this guard).
export const db: DatabaseSync = global.__phonebayDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  global.__phonebayDb = db;
}

if (process.env.SEED_DB !== "false") {
  // Safe despite the circular reference: seed.ts only touches `db` inside a
  // function body (never at module top-level), so the live ESM binding is
  // fully populated by the time this actually executes.
  seedIfEmpty();
}

/** Generates a URL-safe unique id (cuid-like) without extra dependencies. */
export function generateId(prefix = ""): string {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${time}${random}`;
}
