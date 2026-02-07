import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';

export async function seedTenants(dataSource: DataSource): Promise<void> {
  const tenantRepository = dataSource.getRepository(Tenant);

  // Check if tenants already exist
  const existingTenants = await tenantRepository.count();
  if (existingTenants > 0) {
    console.log('Tenants already seeded, skipping...');
    return;
  }

  // Create default test tenant
  const testTenant = tenantRepository.create({
    name: 'Test Tenant',
    subdomain: 'test',
    status: 'active',
    settings: {},
  });

  await tenantRepository.save(testTenant);

  console.log('✅ Seeded test tenant: test.fixapp.com');
  console.log(`   Tenant ID: ${testTenant.id}`);
}
