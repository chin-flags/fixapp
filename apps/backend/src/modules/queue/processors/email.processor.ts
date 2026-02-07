import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailJobDto } from '../dto/email-job.dto';

@Processor('emails')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobDto>): Promise<void> {
    this.logger.log(
      `Processing email job ${job.id} - Attempt ${job.attemptsMade + 1}`,
    );

    const { to, subject, template, data } = job.data;

    try {
      // TODO: Integrate with AWS SES in Story 1.9
      // For now, just simulate email sending
      await this.simulateEmailSending(to, subject, template, data);

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Email sending failed: ${error.message}`);
      throw error; // Trigger retry
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Email job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }

  private async simulateEmailSending(
    to: string,
    subject: string,
    template: string,
    data: any,
  ): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate occasional failure for testing retry logic
    if (Math.random() < 0.1) {
      throw new Error('Simulated email service error');
    }

    this.logger.debug(`[SIMULATED] Email sent to ${to}: ${subject}`);
  }
}
