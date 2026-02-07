import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  private tenantCache: Map<string, { tenant: Tenant; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    // Check cache first
    const cached = this.tenantCache.get(subdomain);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.tenant;
    }

    // Cache miss or expired - query database
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain },
    });

    if (tenant) {
      // Update cache
      this.tenantCache.set(subdomain, {
        tenant,
        timestamp: Date.now(),
      });
    }

    return tenant;
  }

  async findBySubdomainOrThrow(subdomain: string): Promise<Tenant> {
    const tenant = await this.findBySubdomain(subdomain);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== 'active') {
      throw new ForbiddenException('Tenant is inactive');
    }

    return tenant;
  }

  async createTenant(data: {
    name: string;
    subdomain: string;
    status?: string;
    settings?: Record<string, any>;
  }): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...data,
      status: data.status || 'active',
      settings: data.settings || {},
    });

    return this.tenantRepository.save(tenant);
  }

  invalidateCache(subdomain: string): void {
    this.tenantCache.delete(subdomain);
  }

  clearCache(): void {
    this.tenantCache.clear();
  }
}
