import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  settings: Record<string, any>;
}

@Injectable()
export class TenantContextService {
  private storage = new AsyncLocalStorage<TenantContext>();

  run<R>(tenant: TenantContext, callback: () => R): R {
    return this.storage.run(tenant, callback);
  }

  getCurrentTenant(): TenantContext | undefined {
    return this.storage.getStore();
  }

  getTenantOrThrow(): TenantContext {
    const tenant = this.getCurrentTenant();
    if (!tenant) {
      throw new Error('Tenant context not available');
    }
    return tenant;
  }
}
