import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../src/modules/tenants/entities/tenant.entity';
import { TestData } from './fixtures/test-data.entity';
import { TenantContextService } from '../src/common/services/tenant-context.service';
import { TenantQuerySubscriber } from '../src/common/subscribers/tenant-query.subscriber';
import { SnakeNamingStrategy } from '../src/database/naming-strategy/snake-naming.strategy';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tenantRepository: Repository<Tenant>;
  let testDataRepository: Repository<TestData>;
  let tenantContextService: TenantContextService;

  let tenant1: Tenant;
  let tenant2: Tenant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              DB_HOST: process.env.DB_HOST || 'localhost',
              DB_PORT: parseInt(process.env.DB_PORT || '5432'),
              DB_NAME: process.env.DB_NAME || 'fixapp_dev',
              DB_USER: process.env.DB_USER || 'postgres',
              DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
              NODE_ENV: 'test',
            }),
          ],
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'postgres' as const,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'fixapp_dev',
            entities: [Tenant, TestData],
            synchronize: true, // Only for tests
            dropSchema: true, // Clean slate for each test run
            namingStrategy: new SnakeNamingStrategy(),
            subscribers: [TenantQuerySubscriber],
          }),
        }),
        TypeOrmModule.forFeature([Tenant, TestData]),
      ],
      providers: [TenantContextService, TenantQuerySubscriber],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    tenantRepository = dataSource.getRepository(Tenant);
    testDataRepository = dataSource.getRepository(TestData);
    tenantContextService =
      app.get<TenantContextService>(TenantContextService);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Create two test tenants
    tenant1 = tenantRepository.create({
      name: 'Tenant 1',
      subdomain: 'tenant1',
      status: 'active',
      settings: {},
    });
    await tenantRepository.save(tenant1);

    tenant2 = tenantRepository.create({
      name: 'Tenant 2',
      subdomain: 'tenant2',
      status: 'active',
      settings: {},
    });
    await tenantRepository.save(tenant2);
  });

  afterEach(async () => {
    // Clean up test data
    await testDataRepository.delete({});
    await tenantRepository.delete({});
  });

  describe('Automatic tenant_id injection on INSERT', () => {
    it('should automatically inject tenant_id when creating data', async () => {
      await tenantContextService.run(tenant1, async () => {
        const testData = testDataRepository.create({ name: 'Test Data 1' });
        const saved = await testDataRepository.save(testData);

        expect(saved.tenantId).toBe(tenant1.id);
      });
    });

    it('should inject different tenant_id for different contexts', async () => {
      let data1Id: string;
      let data2Id: string;

      await tenantContextService.run(tenant1, async () => {
        const testData = testDataRepository.create({ name: 'Tenant 1 Data' });
        const saved = await testDataRepository.save(testData);
        data1Id = saved.id;
        expect(saved.tenantId).toBe(tenant1.id);
      });

      await tenantContextService.run(tenant2, async () => {
        const testData = testDataRepository.create({ name: 'Tenant 2 Data' });
        const saved = await testDataRepository.save(testData);
        data2Id = saved.id;
        expect(saved.tenantId).toBe(tenant2.id);
      });

      // Verify both records exist in database with correct tenant_ids
      const data1 = await testDataRepository.findOne({ where: { id: data1Id! } });
      const data2 = await testDataRepository.findOne({ where: { id: data2Id! } });

      expect(data1?.tenantId).toBe(tenant1.id);
      expect(data2?.tenantId).toBe(tenant2.id);
    });
  });

  describe('Tenant isolation on SELECT (manual filtering)', () => {
    it('should only return data for current tenant', async () => {
      // Create data for both tenants
      await tenantContextService.run(tenant1, async () => {
        await testDataRepository.save(
          testDataRepository.create({ name: 'Tenant 1 Data' }),
        );
      });

      await tenantContextService.run(tenant2, async () => {
        await testDataRepository.save(
          testDataRepository.create({ name: 'Tenant 2 Data' }),
        );
      });

      // Query as tenant 1 (with manual filtering)
      await tenantContextService.run(tenant1, async () => {
        const data = await testDataRepository.find({
          where: { tenantId: tenant1.id },
        });
        expect(data).toHaveLength(1);
        expect(data[0].name).toBe('Tenant 1 Data');
        expect(data[0].tenantId).toBe(tenant1.id);
      });

      // Query as tenant 2 (with manual filtering)
      await tenantContextService.run(tenant2, async () => {
        const data = await testDataRepository.find({
          where: { tenantId: tenant2.id },
        });
        expect(data).toHaveLength(1);
        expect(data[0].name).toBe('Tenant 2 Data');
        expect(data[0].tenantId).toBe(tenant2.id);
      });
    });

    it('should prevent cross-tenant data access', async () => {
      let tenant1DataId: string;
      let tenant2DataId: string;

      // Create data for tenant 1
      await tenantContextService.run(tenant1, async () => {
        const data = await testDataRepository.save(
          testDataRepository.create({ name: 'Tenant 1 Data' }),
        );
        tenant1DataId = data.id;
      });

      // Create data for tenant 2
      await tenantContextService.run(tenant2, async () => {
        const data = await testDataRepository.save(
          testDataRepository.create({ name: 'Tenant 2 Data' }),
        );
        tenant2DataId = data.id;
      });

      // Tenant 1 should not see tenant 2's data
      await tenantContextService.run(tenant1, async () => {
        const data = await testDataRepository.find({
          where: { tenantId: tenant1.id },
        });
        const ids = data.map((d) => d.id);
        expect(ids).toContain(tenant1DataId);
        expect(ids).not.toContain(tenant2DataId);
      });

      // Tenant 2 should not see tenant 1's data
      await tenantContextService.run(tenant2, async () => {
        const data = await testDataRepository.find({
          where: { tenantId: tenant2.id },
        });
        const ids = data.map((d) => d.id);
        expect(ids).toContain(tenant2DataId);
        expect(ids).not.toContain(tenant1DataId);
      });
    });
  });

  describe('Tenant isolation violation detection', () => {
    it('should throw error when loading entity with mismatched tenant_id', async () => {
      let wrongTenantDataId: string;

      // Create data for tenant 2
      await tenantContextService.run(tenant2, async () => {
        const data = await testDataRepository.save(
          testDataRepository.create({ name: 'Tenant 2 Data' }),
        );
        wrongTenantDataId = data.id;
      });

      // Try to load tenant 2's data while in tenant 1 context
      await tenantContextService.run(tenant1, async () => {
        // Direct findOne with wrong ID should throw violation error
        await expect(
          testDataRepository.findOne({ where: { id: wrongTenantDataId } }),
        ).rejects.toThrow('Tenant isolation violation detected');
      });
    });
  });
});
