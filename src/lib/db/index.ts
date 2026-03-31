import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Database = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: Database | null = null;

function getConnectionString() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING environment variable is not set');
  }

  return connectionString;
}

function getDbInstance() {
  if (!dbInstance) {
    const sql = postgres(getConnectionString());
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
}

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    return Reflect.get(getDbInstance(), property, receiver);
  },
});

// Helper to get current tenant from context
// This will be set via middleware based on subdomain/domain
export async function getCurrentTenantId(): Promise<string | null> {
  // This will be populated by middleware
  // For now, return null (will be implemented with auth)
  return null;
}
