import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId'])
@Index(['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  tokenHash!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
