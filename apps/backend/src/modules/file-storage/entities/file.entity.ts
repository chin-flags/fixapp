import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('files')
@Index(['tenantId', 'resourceType', 'resourceId'])
@Index(['tenantId', 'createdAt'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @Column({ name: 's3_key', type: 'varchar', length: 500 })
  s3Key!: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename!: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize!: number;

  @Column({ name: 'content_type', type: 'varchar', length: 100 })
  contentType!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50, nullable: true })
  resourceType?: string;

  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resourceId?: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
