import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { EmailProcessor } from './processors/email.processor';
import { DocumentProcessor } from './processors/document.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    // Configure Bull with Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times: number) => {
            // Exponential backoff for reconnection
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),

    // Register queues
    BullModule.registerQueue(
      { name: 'emails' },
      { name: 'documents' },
      { name: 'notifications' },
    ),

    // Configure Bull Board for queue visualization
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
      boardOptions: {
        uiConfig: {
          boardTitle: 'FixApp Queue Dashboard',
          boardLogo: {
            path: '',
            width: 0,
            height: 0,
          },
          miscLinks: [],
          favIcon: {
            default: 'static/images/logo.svg',
            alternative: 'static/images/logo.svg',
          },
        },
      },
    }),

    BullBoardModule.forFeature({
      name: 'emails',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'documents',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'notifications',
      adapter: BullAdapter,
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, EmailProcessor, DocumentProcessor, NotificationProcessor],
  exports: [QueueService],
})
export class QueueModule {}
