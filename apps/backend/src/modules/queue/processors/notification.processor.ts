import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationJobDto } from '../dto/notification-job.dto';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  // NOTE: WebSocket gateway will be injected in Story 1.9 when notifications are fully implemented
  // For now, this is a placeholder

  @Process('push-notification')
  async handlePushNotification(job: Job<NotificationJobDto>): Promise<void> {
    this.logger.log(`Processing notification job ${job.id}`);

    const { userId, tenantId, type, message, metadata } = job.data;

    try {
      // TODO: Integrate with WebSocket gateway from Story 1.6
      // Send push notification via WebSocket
      await this.simulatePushNotification(userId, type, message);

      this.logger.log(`Notification sent to user ${userId}`);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Notification sending failed: ${error.message}`);
      throw error;
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Notification job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Notification job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }

  private async simulatePushNotification(
    userId: string,
    type: string,
    message: string,
  ): Promise<void> {
    // Simulate WebSocket emission
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.logger.debug(
      `[SIMULATED] Push notification sent to ${userId}: ${message}`,
    );
  }
}
