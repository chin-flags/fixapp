import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFilesTable1766908900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 's3_key',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'original_filename',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'content_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'resource_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'resource_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'uploaded_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create index on tenant_id
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_files_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    // Create composite index on tenant_id, resource_type, resource_id
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_files_tenant_resource',
        columnNames: ['tenant_id', 'resource_type', 'resource_id'],
      }),
    );

    // Create composite index on tenant_id, created_at for pagination
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_files_tenant_created',
        columnNames: ['tenant_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('files', 'IDX_files_tenant_created');
    await queryRunner.dropIndex('files', 'IDX_files_tenant_resource');
    await queryRunner.dropIndex('files', 'IDX_files_tenant_id');
    await queryRunner.dropTable('files');
  }
}
