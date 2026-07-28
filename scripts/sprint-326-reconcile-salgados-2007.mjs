/**
 * @deprecated Use reconcile-salgados-2007-official-list.mjs
 * Delega para a lista oficial do operador.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "reconcile-salgados-2007-official-list.mjs");
const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
process.exit(result.status ?? 1);
