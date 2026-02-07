import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenantId!: string; // Will be mapped to tenant_id by SnakeNamingStrategy

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date; // Will be mapped to created_at by SnakeNamingStrategy

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date; // Will be mapped to updated_at by SnakeNamingStrategy
}
