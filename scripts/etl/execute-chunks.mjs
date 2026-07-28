#!/usr/bin/env node
/**
 * Execute pre-generated ETL chunk SQL files in strict order.
 * Requires DATABASE_URL (postgresql connection string).
 */
import fs from "fs";
import path from "path";
import postgres from "postgres";

const CHUNK_DIR = path.join(process.cwd(), "scripts", "etl", "chunks");
const ORDER = [
  "phase1.part1.sql",
  "phase2.part1.sql",
  "phase2.part2.sql",
  "phase2.part3.sql",
  "phase3.part1.sql",
  "phase3.part2.sql",
  "phase3.part3.sql",
  "phase4.part1.sql",
  "phase4.part2.sql",
  "phase4.part3.sql",
  "phase4.part4.sql",
  "phase4.part5.sql",
  "phase4.part6.sql",
  "phase4.part7.sql",
  "phase5.part1.sql",
  "phase5.part2.sql",
];

const startFrom = process.argv.find((a) => a.startsWith("--from="))?.split("=")[1];
const startIndex = startFrom ? ORDER.indexOf(startFrom) : 0;
if (startIndex < 0) {
  console.error(`Unknown --from file: ${startFrom}`);
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });
const results = [];

try {
  for (let i = startIndex; i < ORDER.length; i++) {
    const file = ORDER[i];
    const full = path.join(CHUNK_DIR, file);
    const query = fs.readFileSync(full, "utf8");
    process.stdout.write(`Executing ${file} (${query.length} bytes)... `);
    await sql.unsafe(query);
    process.stdout.write("OK\n");
    results.push({ file, status: "ok" });
  }
} catch (err) {
  const failed = ORDER[startIndex + results.length] ?? "unknown";
  console.error(`\nFAILED at ${failed}:`, err.message);
  fs.writeFileSync(
    path.join(process.cwd(), "scripts", "etl", "chunk-run-error.json"),
    JSON.stringify({ failed, error: err.message, completed: results }, null, 2)
  );
  process.exit(1);
} finally {
  await sql.end();
}

console.log("\nAll chunks executed successfully:");
console.log(JSON.stringify(results, null, 2));
