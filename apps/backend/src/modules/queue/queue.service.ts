import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { EmailJobDto } from './dto/email-job.dto';
import { PdfJobDto, ExcelJobDto } from './dto/document-job.dto';
import { NotificationJobDto } from './dto/notification-job.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('emails') private emailQueue: Queue,
    @InjectQueue('documents') private documentQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  // Default job options with retry logic
  private getDefaultJobOptions(): JobOptions {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2s, then 4s, then 8s
      },
      removeOnComplete: true,
      removeOnFail: false, // Keep failed jobs for inspection
    };
  }

  // Email queue operations
  async addEmailJob(
    jobData: EmailJobDto,
    options?: JobOptions,
  ): Promise<string> {
    const job = await this.emailQueue.add('send-email', jobData, {
      ...this.getDefaultJobOptions(),
      ...options,
    });

    this.logger.log(`Email job queued: ${job.id} to ${jobData.to}`);
    return job.id.toString();
  }

  // Document queue operations
  async addPdfJob(jobData: PdfJobDto, options?: JobOptions): Promise<string> {
    const job = await this.documentQueue.add('generate-pdf', jobData, {
      ...this.getDefaultJobOptions(),
      ...options,
    });

    this.logger.log(
      `PDF generation job queued: ${job.id} for RCA ${jobData.rcaId}`,
    );
    return job.id.toString();
  }

  async addExcelJob(
    jobData: ExcelJobDto,
    options?: JobOptions,
  ): Promise<string> {
    const job = await this.documentQueue.add('generate-excel', jobData, {
      ...this.getDefaultJobOptions(),
      ...options,
    });

    this.logger.log(
      `Excel export job queued: ${job.id} for ${jobData.exportType}`,
    );
    return job.id.toString();
  }

  // Notification queue operations
  async addNotificationJob(
    jobData: NotificationJobDto,
    options?: JobOptions,
  ): Promise<string> {
    const job = await this.notificationQueue.add('push-notification', jobData, {
      ...this.getDefaultJobOptions(),
      ...options,
    });

    this.logger.log(
      `Notification job queued: ${job.id} for user ${jobData.userId}`,
    );
    return job.id.toString();
  }

  // Queue health and monitoring
  async getQueueHealth(): Promise<{
    emails: QueueHealth;
    documents: QueueHealth;
    notifications: QueueHealth;
  }> {
    const [emailHealth, documentHealth, notificationHealth] =
      await Promise.all([
        this.getQueueStats(this.emailQueue),
        this.getQueueStats(this.documentQueue),
        this.getQueueStats(this.notificationQueue),
      ]);

    return {
      emails: emailHealth,
      documents: documentHealth,
      notifications: notificationHealth,
    };
  }

  private async getQueueStats(queue: Queue): Promise<QueueHealth> {
    const [waiting, active, completed, failed, delayed, paused] =
      await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
        queue.isPaused(),
      ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    };
  }

  // Failed job management
  async getFailedJobs(
    queueName: 'emails' | 'documents' | 'notifications',
    start = 0,
    end = 10,
  ): Promise<any[]> {
    const queue = this.getQueueByName(queueName);
    const failedJobs = await queue.getFailed(start, end);

    return failedJobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    }));
  }

  async retryFailedJob(
    queueName: 'emails' | 'documents' | 'notifications',
    jobId: string,
  ): Promise<void> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.retry();
    this.logger.log(`Retrying job ${jobId} in queue ${queueName}`);
  }

  private getQueueByName(
    queueName: 'emails' | 'documents' | 'notifications',
  ): Queue {
    switch (queueName) {
      case 'emails':
        return this.emailQueue;
      case 'documents':
        return this.documentQueue;
      case 'notifications':
        return this.notificationQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}

// Health status interface
export interface QueueHealth {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}
