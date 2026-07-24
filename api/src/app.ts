import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import type { PrismaClient } from "@prisma/client";

import { env } from "./config/env.js";
import { checkDatabaseHealth, prisma } from "./db/prisma.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { openApiDocument } from "./openapi.js";
import {
  createHealthRouter,
  type DatabaseHealthCheck,
} from "./routes/health.js";
import { createTasksRouter } from "./routes/tasks.js";
import { createTeamsRouter } from "./routes/teams.js";

type AppDependencies = {
  checkDatabase?: DatabaseHealthCheck;
  prisma?: PrismaClient;
};

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  const checkDatabase = dependencies.checkDatabase ?? checkDatabaseHealth;
  const database = dependencies.prisma ?? prisma;

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));
  app.use(createHealthRouter(checkDatabase));
  app.get("/openapi.json", (_request, response) =>
    response.json(openApiDocument),
  );
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api/teams", createTeamsRouter(database));
  app.use("/api/tasks", createTasksRouter(database));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
