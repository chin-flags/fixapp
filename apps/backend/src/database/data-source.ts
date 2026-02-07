import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from './naming-strategy/snake-naming.strategy';

config(); // Load .env file

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new SnakeNamingStrategy(),
});
