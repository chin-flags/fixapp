import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from './naming-strategy/snake-naming.strategy';
import { TenantQuerySubscriber } from '../common/subscribers/tenant-query.subscriber';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        subscribers: [TenantQuerySubscriber],
        synchronize: false, // NEVER true in production
        logging: configService.get('NODE_ENV') === 'development',
        namingStrategy: new SnakeNamingStrategy(),
        // Connection pool settings
        extra: {
          min: 2,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
