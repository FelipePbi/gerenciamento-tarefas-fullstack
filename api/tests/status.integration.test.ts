import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("PostgreSQL integration", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("queries the real database", async () => {
    const response = await request(app).get("/api/v1/status");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ api: "ok", database: "ok" });
    expect(new Date(response.body.databaseTime).toISOString()).toBe(
      response.body.databaseTime,
    );
  });
});
