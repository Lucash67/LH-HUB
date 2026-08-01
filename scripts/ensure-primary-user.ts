import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { hashPassword } from "../src/lib/auth/password";
import { upsertUserByEmail } from "../src/platform/db/repositories/user-repository";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const email = "lucashcampos667@gmail.com";
  const name = "Lucas";
  const password = "060607Lc";

  const passwordHash = await hashPassword(password);
  const user = await upsertUserByEmail({ email, name, passwordHash });

  console.log(`Conta pronta: ${user.email} (${user.name})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
