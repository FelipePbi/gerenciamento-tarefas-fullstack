import { Router } from "express";

export type DatabaseHealthCheck = () => Promise<{ databaseTime: string }>;

export function createHealthRouter(checkDatabase: DatabaseHealthCheck): Router {
  const router = Router();

  router.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "rn-api",
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/health/db", async (_request, response) => {
    try {
      const { databaseTime } = await checkDatabase();
      response.json({ status: "ok", database: "postgresql", databaseTime });
    } catch {
      response.status(503).json({
        status: "error",
        database: "postgresql",
        message: "Database unavailable",
      });
    }
  });

  router.get("/api/v1/status", async (_request, response) => {
    try {
      const { databaseTime } = await checkDatabase();
      response.json({
        api: "ok",
        database: "ok",
        databaseTime,
        message: "Express e PostgreSQL estão conectados.",
      });
    } catch {
      response.status(503).json({
        api: "ok",
        database: "error",
        message: "PostgreSQL está temporariamente indisponível.",
      });
    }
  });

  return router;
}
