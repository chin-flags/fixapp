const DATABASE_URL_ENV_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL",
  "DATABASE_URL",
] as const;

export function getDatabaseConnectionString(): string {
  for (const key of DATABASE_URL_ENV_KEYS) {
    const value = process.env[key];

    if (value) {
      return value;
    }
  }

  throw new Error(
    "Database connection string is not set. Expected one of POSTGRES_URL_NON_POOLING, POSTGRES_URL, or DATABASE_URL."
  );
}

export { DATABASE_URL_ENV_KEYS };
