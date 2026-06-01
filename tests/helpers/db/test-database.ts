export function getTestDatabaseUrl() {
  return (
    process.env.TEST_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    null
  );
}

export function hasTestDatabase() {
  return Boolean(getTestDatabaseUrl());
}

export function requireTestDatabaseUrl() {
  const url = getTestDatabaseUrl();

  if (!url) {
    throw new Error(
      "No test database URL is configured. Set TEST_DATABASE_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL, or DATABASE_URL."
    );
  }

  return url;
}
