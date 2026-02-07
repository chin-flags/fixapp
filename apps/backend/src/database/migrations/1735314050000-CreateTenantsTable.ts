import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTenantsTable1735314050000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'subdomain',
            type: 'varchar',
            length: '63',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create unique index on subdomain
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'uniq_tenants_subdomain',
        columnNames: ['subdomain'],
        isUnique: true,
      }),
    );

    // Create index on status for filtering
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'idx_tenants_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tenants', 'idx_tenants_status');
    await queryRunner.dropIndex('tenants', 'uniq_tenants_subdomain');
    await queryRunner.dropTable('tenants');
  }
}
