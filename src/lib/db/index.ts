import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create PostgreSQL connection
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING environment variable is not set');
}

const sql = postgres(connectionString);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Helper to get current tenant from context
// This will be set via middleware based on subdomain/domain
export async function getCurrentTenantId(): Promise<string | null> {
  // This will be populated by middleware
  // For now, return null (will be implemented with auth)
  return null;
}
