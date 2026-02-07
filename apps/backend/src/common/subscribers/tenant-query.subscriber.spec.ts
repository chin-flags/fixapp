import { TenantQuerySubscriber } from './tenant-query.subscriber';
import { TenantContextService } from '../services/tenant-context.service';
import { InsertEvent, LoadEvent, EntityMetadata } from 'typeorm';

describe('TenantQuerySubscriber', () => {
  let subscriber: TenantQuerySubscriber;
  let tenantContextService: TenantContextService;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    subdomain: 'test',
    status: 'active',
    settings: {},
  };

  beforeEach(() => {
    tenantContextService = new TenantContextService();
    subscriber = new TenantQuerySubscriber(tenantContextService);
  });

  describe('beforeInsert', () => {
    it('should inject tenant_id on insert for tenant-scoped entities', () => {
      const entity = { name: 'Test Entity' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'test_entities',
          columns: [
            { propertyName: 'id' },
            { propertyName: 'tenantId' },
            { propertyName: 'name' },
          ],
        },
      } as InsertEvent<any>;

      tenantContextService.run(mockTenant, () => {
        subscriber.beforeInsert(mockEvent);
        expect(entity).toHaveProperty('tenantId', 'tenant-123');
      });
    });

    it('should skip Tenant entity itself', () => {
      const entity = { name: 'Test Tenant', subdomain: 'test' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'tenants',
          columns: [
            { propertyName: 'id' },
            { propertyName: 'name' },
            { propertyName: 'subdomain' },
          ],
        },
      } as InsertEvent<any>;

      tenantContextService.run(mockTenant, () => {
        subscriber.beforeInsert(mockEvent);
        expect(entity).not.toHaveProperty('tenantId');
      });
    });

    it('should skip entities without tenantId column', () => {
      const entity = { name: 'Global Entity' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'global_entities',
          columns: [{ propertyName: 'id' }, { propertyName: 'name' }],
        },
      } as InsertEvent<any>;

      tenantContextService.run(mockTenant, () => {
        subscriber.beforeInsert(mockEvent);
        expect(entity).not.toHaveProperty('tenantId');
      });
    });

    it('should not inject when no tenant context available', () => {
      const entity = { name: 'Test Entity' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'test_entities',
          columns: [
            { propertyName: 'id' },
            { propertyName: 'tenantId' },
            { propertyName: 'name' },
          ],
        },
      } as InsertEvent<any>;

      subscriber.beforeInsert(mockEvent);
      expect(entity).not.toHaveProperty('tenantId');
    });
  });

  describe('afterLoad', () => {
    it('should allow entity with matching tenant_id', () => {
      const entity = { id: '1', tenantId: 'tenant-123', name: 'Test' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'test_entities',
        } as EntityMetadata,
      } as LoadEvent<any>;

      tenantContextService.run(mockTenant, () => {
        expect(() => subscriber.afterLoad(entity, mockEvent)).not.toThrow();
      });
    });

    it('should throw error for tenant isolation violation', () => {
      const entity = { id: '1', tenantId: 'other-tenant', name: 'Test' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'test_entities',
        } as EntityMetadata,
      } as LoadEvent<any>;

      tenantContextService.run(mockTenant, () => {
        expect(() => subscriber.afterLoad(entity, mockEvent)).toThrow(
          'Tenant isolation violation detected',
        );
      });
    });

    it('should skip Tenant entity itself', () => {
      const entity = { id: 'tenant-123', name: 'Test Tenant', subdomain: 'test' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'tenants',
        } as EntityMetadata,
      } as LoadEvent<any>;

      tenantContextService.run(mockTenant, () => {
        expect(() => subscriber.afterLoad(entity, mockEvent)).not.toThrow();
      });
    });

    it('should skip entities without tenantId', () => {
      const entity = { id: '1', name: 'Global Entity' };
      const mockEvent = {
        entity,
        metadata: {
          tableName: 'global_entities',
        } as EntityMetadata,
      } as LoadEvent<any>;

      tenantContextService.run(mockTenant, () => {
        expect(() => subscriber.afterLoad(entity, mockEvent)).not.toThrow();
      });
    });
  });
});
