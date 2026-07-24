import { describe, expect, it } from "vitest";

import {
  taskInputSchema,
  tasksQuerySchema,
  teamInputSchema,
} from "../src/validation/schemas.js";

describe("domain validation", () => {
  it("trims team input and normalizes color", () => {
    expect(
      teamInputSchema.parse({ name: " Produto ", colorHex: "#aa11cc" }),
    ).toMatchObject({
      name: "Produto",
      colorHex: "#AA11CC",
    });
  });

  it("rejects malformed team colors", () => {
    expect(() =>
      teamInputSchema.parse({ name: "Produto", colorHex: "verde" }),
    ).toThrow();
  });

  it("rejects removed team and task fields", () => {
    expect(() =>
      teamInputSchema.parse({
        name: "Produto",
        colorHex: "#00A67D",
        description: "Campo removido",
      }),
    ).toThrow();
    expect(() =>
      taskInputSchema.parse({
        title: "Tarefa valida",
        dueDate: "2026-08-10T12:00:00.000Z",
      }),
    ).toThrow();
  });

  it("enforces trimmed task title and deduplicates team ids", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const parsed = taskInputSchema.parse({
      title: " Tarefa valida ",
      teamIds: [id, id],
    });
    expect(parsed.title).toBe("Tarefa valida");
    expect(parsed.teamIds).toEqual([id]);
    expect(parsed.status).toBe("PENDING");
  });

  it("rejects invalid pagination, status and sort", () => {
    expect(() => tasksQuerySchema.parse({ offset: "-1" })).toThrow();
    expect(() => tasksQuerySchema.parse({ status: "DONE" })).toThrow();
    expect(() => tasksQuerySchema.parse({ sort: "DROP TABLE" })).toThrow();
    expect(() => tasksQuerySchema.parse({ sort: "dueDate:asc" })).toThrow();
  });
});
