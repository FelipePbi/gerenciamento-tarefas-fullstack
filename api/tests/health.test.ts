import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

describe("health routes", () => {
  it("GET /health returns service health", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", service: "rn-api" });
    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp,
    );
  });

  it("returns JSON 404 for an unknown route", async () => {
    const response = await request(createApp()).get("/missing");
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ROUTE_NOT_FOUND", message: "Rota nao encontrada." },
    });
  });

  it("sanitizes database failures", async () => {
    const app = createApp({
      checkDatabase: async () => Promise.reject(new Error("secret details")),
    });
    const response = await request(app).get("/health/db");
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "error",
      database: "postgresql",
      message: "Database unavailable",
    });
    expect(JSON.stringify(response.body)).not.toContain("secret details");
  });

  it("returns consolidated API and database status", async () => {
    const databaseTime = "2026-07-22T12:00:00.000Z";
    const app = createApp({ checkDatabase: async () => ({ databaseTime }) });
    const response = await request(app).get("/api/v1/status");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      api: "ok",
      database: "ok",
      databaseTime,
      message: "Express e PostgreSQL estão conectados.",
    });
  });

  it("normalizes validation errors without querying the database", async () => {
    const response = await request(createApp())
      .post("/api/tasks")
      .send({ title: " x " });
    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Os dados enviados sao invalidos.",
      },
    });
    expect(response.body.error.details[0]).toMatchObject({ path: "title" });
  });
});
