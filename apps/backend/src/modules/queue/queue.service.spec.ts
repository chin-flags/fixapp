import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { Queue, Job } from 'bull';

describe('QueueService', () => {
  let service: QueueService;
  let emailQueue: jest.Mocked<Queue>;
  let documentQueue: jest.Mocked<Queue>;
  let notificationQueue: jest.Mocked<Queue>;

  const mockJob = {
    id: '123',
    data: {},
    opts: {},
    progress: jest.fn(),
    log: jest.fn(),
    getState: jest.fn(),
  } as unknown as Job;

  beforeEach(async () => {
    const mockQueue = {
      add: jest.fn().mockResolvedValue(mockJob),
      getWaitingCount: jest.fn().mockResolvedValue(5),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getCompletedCount: jest.fn().mockResolvedValue(100),
      getFailedCount: jest.fn().mockResolvedValue(3),
      getDelayedCount: jest.fn().mockResolvedValue(1),
      isPaused: jest.fn().mockResolvedValue(false),
      getFailed: jest.fn().mockResolvedValue([]),
      getJob: jest.fn().mockResolvedValue(mockJob),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken('emails'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('documents'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('notifications'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    emailQueue = module.get(getQueueToken('emails'));
    documentQueue = module.get(getQueueToken('documents'));
    notificationQueue = module.get(getQueueToken('notifications'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addEmailJob', () => {
    it('should add email job to queue', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'welcome',
        data: { name: 'John' },
      };

      const jobId = await service.addEmailJob(emailData);

      expect(emailQueue.add).toHaveBeenCalledWith('send-email', emailData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      expect(jobId).toBe('123');
    });

    it('should merge custom options with defaults', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        template: 'test',
        data: {},
      };
      const customOptions = { priority: 1 };

      await service.addEmailJob(emailData, customOptions);

      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailData,
        expect.objectContaining({
          attempts: 3,
          priority: 1,
        }),
      );
    });
  });

  describe('addPdfJob', () => {
    it('should add PDF generation job to queue', async () => {
      const pdfData = {
        documentType: 'fishbone',
        rcaId: 'rca-123',
        tenantId: 'tenant-123',
      };

      const jobId = await service.addPdfJob(pdfData);

      expect(documentQueue.add).toHaveBeenCalledWith('generate-pdf', pdfData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      expect(jobId).toBe('123');
    });
  });

  describe('addExcelJob', () => {
    it('should add Excel export job to queue', async () => {
      const excelData = {
        exportType: 'rca-list',
        filters: { status: 'open' },
        tenantId: 'tenant-123',
      };

      const jobId = await service.addExcelJob(excelData);

      expect(documentQueue.add).toHaveBeenCalledWith(
        'generate-excel',
        excelData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      expect(jobId).toBe('123');
    });
  });

  describe('addNotificationJob', () => {
    it('should add notification job to queue', async () => {
      const notificationData = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        type: 'rca-updated',
        message: 'Your RCA has been updated',
        metadata: { rcaId: 'rca-123' },
      };

      const jobId = await service.addNotificationJob(notificationData);

      expect(notificationQueue.add).toHaveBeenCalledWith(
        'push-notification',
        notificationData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      expect(jobId).toBe('123');
    });
  });

  describe('getQueueHealth', () => {
    it('should return health stats for all queues', async () => {
      const health = await service.getQueueHealth();

      expect(health).toEqual({
        emails: {
          waiting: 5,
          active: 2,
          completed: 100,
          failed: 3,
          delayed: 1,
          paused: false,
        },
        documents: {
          waiting: 5,
          active: 2,
          completed: 100,
          failed: 3,
          delayed: 1,
          paused: false,
        },
        notifications: {
          waiting: 5,
          active: 2,
          completed: 100,
          failed: 3,
          delayed: 1,
          paused: false,
        },
      });

      expect(emailQueue.getWaitingCount).toHaveBeenCalled();
      expect(emailQueue.getActiveCount).toHaveBeenCalled();
      expect(emailQueue.getCompletedCount).toHaveBeenCalled();
      expect(emailQueue.getFailedCount).toHaveBeenCalled();
      expect(emailQueue.getDelayedCount).toHaveBeenCalled();
      expect(emailQueue.isPaused).toHaveBeenCalled();
    });
  });

  describe('getFailedJobs', () => {
    it('should return failed jobs for specified queue', async () => {
      const mockFailedJob = {
        id: '456',
        name: 'send-email',
        data: { to: 'test@example.com' },
        failedReason: 'Connection error',
        stacktrace: ['Error at...'],
        attemptsMade: 3,
        timestamp: 1234567890,
        processedOn: 1234567900,
        finishedOn: 1234567910,
      };

      emailQueue.getFailed.mockResolvedValue([mockFailedJob as any]);

      const failedJobs = await service.getFailedJobs('emails', 0, 10);

      expect(emailQueue.getFailed).toHaveBeenCalledWith(0, 10);
      expect(failedJobs).toEqual([
        {
          id: '456',
          name: 'send-email',
          data: { to: 'test@example.com' },
          failedReason: 'Connection error',
          stacktrace: ['Error at...'],
          attemptsMade: 3,
          timestamp: 1234567890,
          processedOn: 1234567900,
          finishedOn: 1234567910,
        },
      ]);
    });

    it('should use default pagination values', async () => {
      emailQueue.getFailed.mockResolvedValue([]);

      await service.getFailedJobs('emails');

      expect(emailQueue.getFailed).toHaveBeenCalledWith(0, 10);
    });
  });

  describe('retryFailedJob', () => {
    it('should retry a failed job', async () => {
      const mockJobWithRetry = {
        ...mockJob,
        retry: jest.fn().mockResolvedValue(undefined),
      };

      emailQueue.getJob.mockResolvedValue(mockJobWithRetry as any);

      await service.retryFailedJob('emails', '456');

      expect(emailQueue.getJob).toHaveBeenCalledWith('456');
      expect(mockJobWithRetry.retry).toHaveBeenCalled();
    });

    it('should throw error if job not found', async () => {
      emailQueue.getJob.mockResolvedValue(null);

      await expect(service.retryFailedJob('emails', '999')).rejects.toThrow(
        'Job 999 not found in queue emails',
      );
    });
  });
});
