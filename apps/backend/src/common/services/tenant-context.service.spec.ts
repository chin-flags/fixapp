import { TenantContextService, TenantContext } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(() => {
    service = new TenantContextService();
  });

  const mockTenant: TenantContext = {
    id: 'tenant-123',
    name: 'Test Tenant',
    subdomain: 'test',
    status: 'active',
    settings: {},
  };

  describe('run', () => {
    it('should store tenant context for the duration of the callback', () => {
      service.run(mockTenant, () => {
        const tenant = service.getCurrentTenant();
        expect(tenant).toBeDefined();
        expect(tenant?.id).toBe('tenant-123');
        expect(tenant?.subdomain).toBe('test');
      });
    });

    it('should return the callback result', () => {
      const result = service.run(mockTenant, () => {
        return 'test result';
      });
      expect(result).toBe('test result');
    });

    it('should clear context after callback completes', () => {
      service.run(mockTenant, () => {
        expect(service.getCurrentTenant()).toBeDefined();
      });
      expect(service.getCurrentTenant()).toBeUndefined();
    });
  });

  describe('getCurrentTenant', () => {
    it('should return undefined when no context is set', () => {
      expect(service.getCurrentTenant()).toBeUndefined();
    });

    it('should return the current tenant when context is set', () => {
      service.run(mockTenant, () => {
        const tenant = service.getCurrentTenant();
        expect(tenant).toEqual(mockTenant);
      });
    });
  });

  describe('getTenantOrThrow', () => {
    it('should throw error when no context is set', () => {
      expect(() => service.getTenantOrThrow()).toThrow(
        'Tenant context not available',
      );
    });

    it('should return tenant when context is set', () => {
      service.run(mockTenant, () => {
        const tenant = service.getTenantOrThrow();
        expect(tenant).toEqual(mockTenant);
      });
    });
  });

  describe('async operations', () => {
    it('should preserve context across async boundaries', async () => {
      await service.run(mockTenant, async () => {
        const tenant1 = service.getCurrentTenant();
        expect(tenant1?.id).toBe('tenant-123');

        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));

        const tenant2 = service.getCurrentTenant();
        expect(tenant2?.id).toBe('tenant-123');
      });
    });

    it('should isolate contexts for concurrent operations', async () => {
      const tenant1: TenantContext = { ...mockTenant, id: 'tenant-1', subdomain: 'tenant1' };
      const tenant2: TenantContext = { ...mockTenant, id: 'tenant-2', subdomain: 'tenant2' };

      const promise1 = service.run(tenant1, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return service.getCurrentTenant();
      });

      const promise2 = service.run(tenant2, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return service.getCurrentTenant();
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1?.id).toBe('tenant-1');
      expect(result2?.id).toBe('tenant-2');
    });
  });
});
