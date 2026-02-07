import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Helper to get current tenant from context
// This will be set via middleware based on subdomain/domain
export async function getCurrentTenantId(): Promise<string | null> {
  // This will be populated by middleware
  // For now, return null (will be implemented with auth)
  return null;
}
