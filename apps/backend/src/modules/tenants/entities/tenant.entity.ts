import { Entity, Column } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @Column('uuid', { primary: true, default: () => 'gen_random_uuid()' })
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('varchar', { length: 63, unique: true })
  subdomain!: string;

  @Column('varchar', { length: 50, default: 'active' })
  status!: string;

  @Column('jsonb', { default: {} })
  settings!: Record<string, any>;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
