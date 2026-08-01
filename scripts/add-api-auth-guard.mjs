import fs from "fs";
import path from "path";

const API_ROOT = path.join(process.cwd(), "src/app/api");
const SKIP = new Set([
  "auth/login/route.ts",
  "auth/register/route.ts",
  "auth/logout/route.ts",
  "auth/forgot-password/route.ts",
  "auth/reset-password/route.ts",
]);

const IMPORT =
  'import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";\n';
const GUARD = `  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
`;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === "route.ts") files.push(full);
  }
  return files;
}

for (const file of walk(API_ROOT)) {
  const rel = path.relative(API_ROOT, file).replace(/\\/g, "/");
  if (SKIP.has(rel) || rel === "auth/me/route.ts") continue;

  let content = fs.readFileSync(file, "utf8");
  if (content.includes("requireApiSession")) continue;

  if (!content.includes(IMPORT.trim())) {
    const nextImport = content.indexOf('import { NextResponse');
    if (nextImport >= 0) {
      const end = content.indexOf("\n", nextImport);
      content = content.slice(0, end + 1) + IMPORT + content.slice(end + 1);
    } else {
      content = IMPORT + content;
    }
  }

  content = content.replace(
    /export async function (GET|POST|PUT|PATCH|DELETE)\([^)]*\) \{\n(\s*try \{)?/g,
    (match, _method, hasTry) => {
      if (match.includes("requireApiSession")) return match;
      if (hasTry) {
        return match.replace("try {", `${GUARD.trim()}\n  try {`);
      }
      return match + GUARD;
    },
  );

  fs.writeFileSync(file, content);
  console.log("patched", rel);
}
