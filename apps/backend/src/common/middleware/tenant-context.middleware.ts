import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../modules/tenants/tenant.service';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract subdomain from hostname or header
    const subdomain = this.extractSubdomain(req);

    if (!subdomain) {
      throw new NotFoundException('Tenant subdomain not found');
    }

    // Lookup tenant
    const tenant = await this.tenantService.findBySubdomain(subdomain);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== 'active') {
      throw new ForbiddenException('Tenant is inactive');
    }

    // Set tenant context for request lifecycle
    this.tenantContext.run(tenant, () => {
      // Attach to request for convenience
      (req as any).tenant = tenant;
      next();
    });
  }

  private extractSubdomain(req: Request): string | null {
    // Check header first (for local dev)
    const headerSubdomain = req.header('X-Tenant-Subdomain');
    if (headerSubdomain) return headerSubdomain;

    // Extract from hostname
    const hostname = req.hostname;
    if (hostname === 'localhost' || hostname.startsWith('localhost')) {
      // Use environment variable for local testing
      return process.env.DEFAULT_TENANT_SUBDOMAIN || null;
    }

    // Production: acme.fixapp.com → acme
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }
}
