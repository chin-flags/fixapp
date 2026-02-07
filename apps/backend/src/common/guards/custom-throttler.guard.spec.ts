import { ExecutionContext } from '@nestjs/common';
import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    // Create a minimal instance for testing the methods
    guard = new CustomThrottlerGuard(
      { throttlers: [{ ttl: 60000, limit: 100 }] } as any,
      {} as any,
      {} as any,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should track authenticated users by user ID', async () => {
      const req = {
        user: { userId: 'user-123' },
        ip: '192.168.1.1',
      };

      const tracker = await guard['getTracker'](req);
      expect(tracker).toBe('user:user-123');
    });

    it('should track unauthenticated requests by IP', async () => {
      const req = {
        ip: '192.168.1.1',
      };

      const tracker = await guard['getTracker'](req);
      expect(tracker).toBe('ip:192.168.1.1');
    });

    it('should fall back to IP if user exists but no userId', async () => {
      const req = {
        user: {},
        ip: '192.168.1.1',
      };

      const tracker = await guard['getTracker'](req);
      expect(tracker).toBe('ip:192.168.1.1');
    });
  });

  describe('getLimit', () => {
    const createMockContext = (hasUser: boolean): ExecutionContext => ({
      switchToHttp: () => ({
        getRequest: (): any =>
          hasUser ? { user: { userId: 'user-123' } } : {},
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    }) as any;

    it('should return 1000 for authenticated users', async () => {
      const context = createMockContext(true);
      const limit = await guard['getLimit'](context);
      expect(limit).toBe(1000);
    });

    it('should return 100 for unauthenticated requests', async () => {
      const context = createMockContext(false);
      const limit = await guard['getLimit'](context);
      expect(limit).toBe(100);
    });
  });

  describe('getTtl', () => {
    it('should return 1 hour (3600000 ms)', async () => {
      const mockContext = {} as ExecutionContext;
      const ttl = await guard['getTtl'](mockContext);
      expect(ttl).toBe(3600000);
    });
  });
});
