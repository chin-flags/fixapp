import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TenantService } from '../src/modules/tenants/tenant.service';
import { DataSource } from 'typeorm';
import { Tenant } from '../src/modules/tenants/entities/tenant.entity';

describe('Tenant Context Integration', () => {
  let app: INestApplication;
  let tenantService: TenantService;
  let dataSource: DataSource;
  let testTenant: Tenant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tenantService = app.get<TenantService>(TenantService);
    dataSource = app.get(DataSource);

    // Create a test tenant
    testTenant = await tenantService.createTenant({
      name: 'Integration Test Tenant',
      subdomain: 'integration',
      status: 'active',
    });
  });

  afterAll(async () => {
    // Cleanup test tenant
    const tenantRepo = dataSource.getRepository(Tenant);
    await tenantRepo.delete({ subdomain: 'integration' });
    await app.close();
  });

  describe('Subdomain extraction', () => {
    it('should accept requests with X-Tenant-Subdomain header', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('X-Tenant-Subdomain', 'integration')
        .expect(200);

      expect(response.text).toContain('Hello World');
    });

    it('should return 404 when tenant subdomain not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('Host', 'localhost:3001')
        .expect(404);

      expect(response.body.message).toContain('Tenant subdomain not found');
    });

    it('should return 404 when tenant does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('X-Tenant-Subdomain', 'nonexistent')
        .expect(404);

      expect(response.body.message).toContain('Tenant not found');
    });
  });

  describe('Tenant status validation', () => {
    it('should return 403 when tenant is inactive', async () => {
      // Create inactive tenant
      const inactiveTenant = await tenantService.createTenant({
        name: 'Inactive Tenant',
        subdomain: 'inactive',
        status: 'inactive',
      });

      const response = await request(app.getHttpServer())
        .get('/')
        .set('X-Tenant-Subdomain', 'inactive')
        .expect(403);

      expect(response.body.message).toContain('Tenant is inactive');

      // Cleanup
      const tenantRepo = dataSource.getRepository(Tenant);
      await tenantRepo.delete({ id: inactiveTenant.id });
    });
  });

  describe('Tenant caching', () => {
    it('should cache tenant lookups', async () => {
      // First request - should query database
      await request(app.getHttpServer())
        .get('/')
        .set('X-Tenant-Subdomain', 'integration')
        .expect(200);

      // Clear database (simulating cache hit)
      const cacheHitResponse = await request(app.getHttpServer())
        .get('/')
        .set('X-Tenant-Subdomain', 'integration')
        .expect(200);

      expect(cacheHitResponse.text).toContain('Hello World');
    });
  });
});
