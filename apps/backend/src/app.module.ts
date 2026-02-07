import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './modules/tenants/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantContextService } from './common/services/tenant-context.service';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { TenantQuerySubscriber } from './common/subscribers/tenant-query.subscriber';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { validate } from './config/env.validation';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { QueueModule } from './modules/queue/queue.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('RATE_LIMIT_TTL') || 60000, // 1 minute
            limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS') || 100,
          },
        ],
        // Note: Redis storage will be added in Story 1.10 when Redis caching layer is implemented
        // For now, using in-memory storage (default)
      }),
    }),
    DatabaseModule,
    TenantModule,
    AuthModule,
    UsersModule,
    WebSocketModule,
    QueueModule,
    FileStorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantContextService,
    TenantQuerySubscriber,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
