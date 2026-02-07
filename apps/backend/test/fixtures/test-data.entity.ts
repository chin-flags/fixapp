import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('test_data')
export class TestData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenantId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
