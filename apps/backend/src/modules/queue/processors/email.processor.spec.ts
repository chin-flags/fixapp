import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { Job } from 'bull';
import { EmailJobDto } from '../dto/email-job.dto';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailProcessor],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleSendEmail', () => {
    it('should process email job successfully', async () => {
      const mockJob = {
        id: '123',
        attemptsMade: 0,
        data: {
          to: 'test@example.com',
          subject: 'Test Email',
          template: 'welcome',
          data: { name: 'John' },
        },
      } as unknown as Job<EmailJobDto>;

      await expect(
        processor.handleSendEmail(mockJob),
      ).resolves.toBeUndefined();
    });

    it('should log email processing', async () => {
      const mockJob = {
        id: '456',
        attemptsMade: 1,
        data: {
          to: 'user@example.com',
          subject: 'Password Reset',
          template: 'reset-password',
          data: { token: 'abc123' },
        },
      } as unknown as Job<EmailJobDto>;

      const logSpy = jest.spyOn(processor['logger'], 'log');

      await processor.handleSendEmail(mockJob);

      expect(logSpy).toHaveBeenCalledWith(
        'Processing email job 456 - Attempt 2',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Email sent successfully to user@example.com',
      );
    });

    it('should handle simulated email failures', async () => {
      const mockJob = {
        id: '789',
        attemptsMade: 0,
        data: {
          to: 'fail@example.com',
          subject: 'Test',
          template: 'test',
          data: {},
        },
      } as unknown as Job<EmailJobDto>;

      // The processor has a 10% random failure rate
      // We'll run it multiple times to test error handling
      let failureOccurred = false;

      for (let i = 0; i < 100; i++) {
        try {
          await processor.handleSendEmail(mockJob);
        } catch (err) {
          const error = err as Error;
          failureOccurred = true;
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('Simulated email service error');
          break;
        }
      }

      // With 100 attempts, we should hit at least one failure
      expect(failureOccurred).toBe(true);
    });
  });

  describe('onCompleted', () => {
    it('should log when job completes', () => {
      const mockJob = {
        id: '123',
      } as Job;

      const logSpy = jest.spyOn(processor['logger'], 'log');

      processor.onCompleted(mockJob);

      expect(logSpy).toHaveBeenCalledWith(
        'Email job 123 completed successfully',
      );
    });
  });

  describe('onFailed', () => {
    it('should log when job fails', () => {
      const mockJob = {
        id: '456',
        attemptsMade: 3,
      } as Job;

      const error = new Error('Network timeout');
      const logSpy = jest.spyOn(processor['logger'], 'error');

      processor.onFailed(mockJob, error);

      expect(logSpy).toHaveBeenCalledWith(
        'Email job 456 failed after 3 attempts: Network timeout',
      );
    });
  });
});
