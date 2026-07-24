import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildDatabaseUrl } from "./prisma.js";

const prismaCli = fileURLToPath(
  new URL("../../node_modules/prisma/build/index.js", import.meta.url),
);
const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [prismaCli, ...args], {
  env: { ...process.env, DATABASE_URL: buildDatabaseUrl() },
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
