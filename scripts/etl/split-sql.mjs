#!/usr/bin/env node
import fs from "fs";

const file = process.argv[2];
const chunkSize = Number(process.argv[3] ?? 25);
if (!file) {
  console.error("Usage: node split-sql.mjs <file.sql> [statementsPerChunk]");
  process.exit(1);
}

const raw = fs.readFileSync(file, "utf8");
const statements = raw
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => (s.endsWith(";") ? s : `${s};`));

const chunks = [];
for (let i = 0; i < statements.length; i += chunkSize) {
  chunks.push(statements.slice(i, i + chunkSize).join("\n"));
}

const outDir = "scripts/etl/chunks";
fs.mkdirSync(outDir, { recursive: true });
const base = file.replace(/\\/g, "/").split("/").pop().replace(".sql", "");

chunks.forEach((chunk, index) => {
  const out = `${outDir}/${base}.part${index + 1}.sql`;
  fs.writeFileSync(out, chunk);
  console.log(out, chunk.length, "bytes", chunk.split(";").length - 1, "stmts");
});

console.log(`Total statements: ${statements.length}, chunks: ${chunks.length}`);
