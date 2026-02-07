import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

describe('QueueController', () => {
  let controller: QueueController;
  let queueService: jest.Mocked<QueueService>;

  beforeEach(async () => {
    const mockQueueService = {
      getQueueHealth: jest.fn(),
      getFailedJobs: jest.fn(),
      retryFailedJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
    queueService = module.get(QueueService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQueueHealth', () => {
    it('should return queue health stats', async () => {
      const mockHealth = {
        emails: {
          waiting: 5,
          active: 2,
          completed: 100,
          failed: 3,
          delayed: 1,
          paused: false,
        },
        documents: {
          waiting: 2,
          active: 1,
          completed: 50,
          failed: 1,
          delayed: 0,
          paused: false,
        },
        notifications: {
          waiting: 10,
          active: 3,
          completed: 200,
          failed: 5,
          delayed: 2,
          paused: false,
        },
      };

      queueService.getQueueHealth.mockResolvedValue(mockHealth);

      const result = await controller.getQueueHealth();

      expect(result).toEqual({
        status: 'success',
        data: mockHealth,
        timestamp: expect.any(String),
      });
      expect(queueService.getQueueHealth).toHaveBeenCalled();
    });
  });

  describe('getFailedJobs', () => {
    it('should return failed jobs for specified queue', async () => {
      const mockFailedJobs = [
        {
          id: '123',
          name: 'send-email',
          data: { to: 'test@example.com' },
          failedReason: 'Connection error',
          stacktrace: ['Error at...'],
          attemptsMade: 3,
          timestamp: 1234567890,
          processedOn: 1234567900,
          finishedOn: 1234567910,
        },
      ];

      queueService.getFailedJobs.mockResolvedValue(mockFailedJobs);

      const result = await controller.getFailedJobs('emails', '0', '10');

      expect(result).toEqual({
        status: 'success',
        data: mockFailedJobs,
        count: 1,
        timestamp: expect.any(String),
      });
      expect(queueService.getFailedJobs).toHaveBeenCalledWith('emails', 0, 10);
    });

    it('should use default pagination when not specified', async () => {
      queueService.getFailedJobs.mockResolvedValue([]);

      await controller.getFailedJobs('documents');

      expect(queueService.getFailedJobs).toHaveBeenCalledWith(
        'documents',
        0,
        10,
      );
    });

    it('should parse pagination parameters correctly', async () => {
      queueService.getFailedJobs.mockResolvedValue([]);

      await controller.getFailedJobs('notifications', '5', '15');

      expect(queueService.getFailedJobs).toHaveBeenCalledWith(
        'notifications',
        5,
        15,
      );
    });
  });

  describe('retryFailedJob', () => {
    it('should retry a failed job', async () => {
      queueService.retryFailedJob.mockResolvedValue(undefined);

      const result = await controller.retryFailedJob('emails', '456');

      expect(result).toEqual({
        status: 'success',
        message: 'Job 456 in queue emails has been retried',
        timestamp: expect.any(String),
      });
      expect(queueService.retryFailedJob).toHaveBeenCalledWith('emails', '456');
    });

    it('should handle retry errors', async () => {
      queueService.retryFailedJob.mockRejectedValue(
        new Error('Job not found'),
      );

      await expect(
        controller.retryFailedJob('documents', '999'),
      ).rejects.toThrow('Job not found');
    });
  });
});
