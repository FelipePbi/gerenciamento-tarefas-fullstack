import { describe, expect, it } from "vitest";

import { readEnv } from "../src/config/env.js";

describe("environment validation", () => {
  it("rejects a missing database password", () => {
    expect(() =>
      readEnv({
        NODE_ENV: "test",
        PGDATABASE: "rn_app",
        PGUSER: "rn_app_user",
      }),
    ).toThrow("PGPASSWORD");
  });

  it("rejects invalid ports", () => {
    expect(() =>
      readEnv({
        NODE_ENV: "test",
        PORT: "70000",
        PGDATABASE: "rn_app",
        PGUSER: "rn_app_user",
        PGPASSWORD: "test-only",
      }),
    ).toThrow("PORT");
  });
});
