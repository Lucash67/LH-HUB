/**
 * Sprint 2.5.2 — Implantação Brigadeiros em modo simplificado (lotes históricos).
 * Delega para reconciliação oficial — sem clientes, horários ou vendas individuais.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "sprint-252-reconcile-brigadeiros.mjs");
const r = spawnSync(process.execPath, [script], { stdio: "inherit" });
process.exit(r.status ?? 1);
