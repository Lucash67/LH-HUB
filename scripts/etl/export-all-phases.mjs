#!/usr/bin/env node
/** Executa todas as fases ETL via Supabase Management API (requer SUPABASE_ACCESS_TOKEN + PROJECT_REF). */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "auyghtmylvkuggugeych";

function runPhase(phase) {
  const result = spawnSync(process.execPath, ["scripts/etl/migrate.mjs", `--phase=${phase}`, "--sql-only"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error(result.stderr);
    throw new Error(`Failed generating SQL for phase ${phase}`);
  }
  return result.stdout.replace(/^-- Phase.*\n/m, "").trim();
}

async function executeSql(query) {
  // placeholder - use migrate.mjs with DATABASE_URL instead
  console.log(query.slice(0, 120), "...");
}

async function main() {
  for (let phase = 1; phase <= 5; phase++) {
    const sql = runPhase(phase);
    const out = path.join("scripts", "etl", `phase${phase}.sql`);
    fs.writeFileSync(out, sql);
    console.log(`Wrote ${out} (${sql.length} chars)`);
  }
}

main();
