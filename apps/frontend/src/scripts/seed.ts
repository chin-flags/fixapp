import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create default tenant
    const [tenant] = await db.insert(tenants).values({
      name: 'Demo Company',
      subdomain: 'demo',
      isActive: true,
    }).returning();

    console.log('✅ Tenant created');
    console.log('   Name:', tenant.name);
    console.log('   Subdomain:', tenant.subdomain);
    console.log('');

    // Create admin user
    const passwordHash = await hash('admin123', 10);
    const [admin] = await db.insert(users).values({
      tenantId: tenant.id,
      email: 'admin@fixapp.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    }).returning();

    console.log('✅ Admin user created');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('   Role:', admin.role);
    console.log('');

    // Create RCA Owner user
    const ownerPasswordHash = await hash('owner123', 10);
    const [owner] = await db.insert(users).values({
      tenantId: tenant.id,
      email: 'owner@fixapp.com',
      passwordHash: ownerPasswordHash,
      name: 'RCA Owner',
      role: 'rca_owner',
      isActive: true,
    }).returning();

    console.log('✅ RCA Owner created');
    console.log('   Email:', owner.email);
    console.log('   Password: owner123');
    console.log('   Role:', owner.role);
    console.log('');

    // Create Team Member user
    const memberPasswordHash = await hash('member123', 10);
    const [member] = await db.insert(users).values({
      tenantId: tenant.id,
      email: 'member@fixapp.com',
      passwordHash: memberPasswordHash,
      name: 'Team Member',
      role: 'team_member',
      isActive: true,
    }).returning();

    console.log('✅ Team Member created');
    console.log('   Email:', member.email);
    console.log('   Password: member123');
    console.log('   Role:', member.role);
    console.log('');

    console.log('═══════════════════════════════════════════');
    console.log('✅ Seeding completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change passwords after first login!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit your app URL');
    console.log('2. Login with one of the accounts above');
    console.log('3. Start building features!');
    console.log('');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
