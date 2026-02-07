import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUsersTable1735315200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'team_member'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'active'",
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
        indices: [
          {
            name: 'uniq_users_tenant_email',
            columnNames: ['tenant_id', 'email'],
            isUnique: true,
          },
          {
            name: 'idx_users_tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'idx_users_email',
            columnNames: ['email'],
          },
          {
            name: 'idx_users_status',
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint to tenants table
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('users');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('tenant_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('users', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('users');
  }
}
