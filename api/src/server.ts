import type { Server } from "node:http";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseHealth, prisma } from "./db/prisma.js";

let server: Server | undefined;
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`${signal} received; shutting down.`);

  await new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await prisma.$disconnect();
}

async function start(): Promise<void> {
  await checkDatabaseHealth();
  server = app.listen(env.PORT, env.HOST, () => {
    console.log(`rn-api listening on http://${env.HOST}:${env.PORT}`);
  });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(
          "Shutdown failed:",
          error instanceof Error ? error.message : "unknown error",
        );
        process.exit(1);
      });
  });
}

start().catch(async (error) => {
  console.error(
    "API startup failed:",
    error instanceof Error ? error.message : "unknown error",
  );
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
