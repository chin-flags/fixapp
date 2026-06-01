import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getDatabaseConnectionString } from './connection-string';

type Database = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: Database | null = null;

function getDbInstance() {
  if (!dbInstance) {
    const sql = postgres(getDatabaseConnectionString());
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
