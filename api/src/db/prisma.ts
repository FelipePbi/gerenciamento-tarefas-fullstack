import { PrismaClient } from "@prisma/client";

import { env } from "../config/env.js";

export function buildDatabaseUrl(): string {
  const user = encodeURIComponent(env.PGUSER);
  const password = encodeURIComponent(env.PGPASSWORD);
  const database = encodeURIComponent(env.PGDATABASE);
  return `postgresql://${user}:${password}@${env.PGHOST}:${env.PGPORT}/${database}?schema=public`;
}

export const prisma = new PrismaClient({
  datasources: { db: { url: buildDatabaseUrl() } },
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export async function checkDatabaseHealth(): Promise<{ databaseTime: string }> {
  const rows = await prisma.$queryRaw<Array<{ database_time: Date }>>`
    SELECT NOW() AS database_time
  `;
  const value = rows[0]?.database_time;
  if (!value) {
    throw new Error("Database did not return its current time");
  }
  return { databaseTime: new Date(value).toISOString() };
}
