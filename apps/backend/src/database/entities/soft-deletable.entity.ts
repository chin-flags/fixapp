import { DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class SoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date; // Will be mapped to deleted_at by SnakeNamingStrategy
}
