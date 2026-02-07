import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
} from 'typeorm';
import { TenantContextService } from '../services/tenant-context.service';

@EventSubscriber()
export class TenantQuerySubscriber implements EntitySubscriberInterface {
  constructor(private readonly tenantContext: TenantContextService) {}

  beforeInsert(event: InsertEvent<any>): void {
    // Skip Tenant entity itself
    if (event.metadata.tableName === 'tenants') return;

    // Check if entity has tenantId property
    const hasTenantId = event.metadata.columns.some(
      (column) => column.propertyName === 'tenantId',
    );

    if (!hasTenantId) return;

    // Auto-inject tenant_id
    const tenant = this.tenantContext.getCurrentTenant();
    if (tenant && event.entity) {
      event.entity.tenantId = tenant.id;
    }
  }

  afterLoad(entity: any, event?: LoadEvent<any>): void | Promise<void> {
    // Skip Tenant entity itself
    if (event?.metadata.tableName === 'tenants') return;

    // Skip if entity doesn't have tenantId
    if (!entity || !entity.tenantId) return;

    // Verify tenant_id matches current context (defense in depth)
    const tenant = this.tenantContext.getCurrentTenant();
    if (tenant && entity.tenantId && entity.tenantId !== tenant.id) {
      throw new Error(
        `Tenant isolation violation detected: expected ${tenant.id}, got ${entity.tenantId}`,
      );
    }
  }
}
