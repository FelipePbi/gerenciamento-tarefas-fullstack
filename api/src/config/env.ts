import dotenv from "dotenv";

dotenv.config();

export type AppEnvironment = {
  NODE_ENV: "development" | "test" | "production";
  HOST: string;
  PORT: number;
  PGHOST: string;
  PGPORT: number;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  PGPOOL_MAX: number;
  CORS_ORIGIN: string;
};

function required(source: NodeJS.ProcessEnv, key: string): string {
  const value = source[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function integerInRange(
  source: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = source[key]?.trim();
  const value = raw ? Number(raw) : fallback;
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${key} must be an integer from ${minimum} to ${maximum}`);
  }
  return value;
}

export function readEnv(
  source: NodeJS.ProcessEnv = process.env,
): AppEnvironment {
  const nodeEnv = source.NODE_ENV?.trim() || "development";
  if (!["development", "test", "production"].includes(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production");
  }

  return {
    NODE_ENV: nodeEnv as AppEnvironment["NODE_ENV"],
    HOST: source.HOST?.trim() || "0.0.0.0",
    PORT: integerInRange(source, "PORT", 3000, 1, 65535),
    PGHOST: source.PGHOST?.trim() || "127.0.0.1",
    PGPORT: integerInRange(source, "PGPORT", 5432, 1, 65535),
    PGDATABASE: required(source, "PGDATABASE"),
    PGUSER: required(source, "PGUSER"),
    PGPASSWORD: required(source, "PGPASSWORD"),
    PGPOOL_MAX: integerInRange(source, "PGPOOL_MAX", 10, 1, 100),
    CORS_ORIGIN: source.CORS_ORIGIN?.trim() || "*",
  };
}

export const env = readEnv();
