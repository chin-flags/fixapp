import {
  DATABASE_URL_ENV_KEYS,
  getDatabaseConnectionString,
} from "@/lib/db/connection-string";

describe("getDatabaseConnectionString", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };

    for (const key of DATABASE_URL_ENV_KEYS) {
      delete process.env[key];
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("prefers POSTGRES_URL_NON_POOLING over other database env vars", () => {
    process.env.DATABASE_URL = "postgres://database-url";
    process.env.POSTGRES_URL = "postgres://postgres-url";
    process.env.POSTGRES_URL_NON_POOLING = "postgres://non-pooling-url";

    expect(getDatabaseConnectionString()).toBe("postgres://non-pooling-url");
  });

  it("falls back to DATABASE_URL when postgres-specific env vars are absent", () => {
    process.env.DATABASE_URL = "postgres://database-url";

    expect(getDatabaseConnectionString()).toBe("postgres://database-url");
  });

  it("throws a clear error when no supported database env var is set", () => {
    expect(() => getDatabaseConnectionString()).toThrow(
      "Database connection string is not set. Expected one of POSTGRES_URL_NON_POOLING, POSTGRES_URL, or DATABASE_URL."
    );
  });
});
