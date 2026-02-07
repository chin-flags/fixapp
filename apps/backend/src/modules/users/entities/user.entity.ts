import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
@Index(['tenantId'])
@Index(['email'])
@Index(['status'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50, default: 'team_member' })
  role!: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;
}
