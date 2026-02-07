import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RcaGateway } from './websocket.gateway';
import { RedisService } from '../redis/redis.service';
import { Socket } from 'socket.io';

describe('RcaGateway', () => {
  let gateway: RcaGateway;
  let jwtService: JwtService;
  let redisService: RedisService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-123',
    data: {},
    handshake: {
      auth: {
        token: 'valid-token',
      },
    },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  } as unknown as Socket;

  const mockUser = {
    userId: 'user-123',
    tenantId: 'tenant-123',
    role: 'rca_owner',
    email: 'user@example.com',
  };

  const mockDecodedToken = {
    sub: 'user-123',
    tenantId: 'tenant-123',
    role: 'rca_owner',
    email: 'user@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RcaGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    gateway = module.get<RcaGateway>(RcaGateway);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log gateway initialization', () => {
      const loggerSpy = jest.spyOn(gateway['logger'], 'log');
      const mockServer: any = {
        use: jest.fn(),
      };

      gateway.afterInit(mockServer);

      expect(loggerSpy).toHaveBeenCalledWith('WebSocket Gateway initialized');
      expect(mockServer.use).toHaveBeenCalled();
    });

    it('should setup authentication middleware', () => {
      const mockServer: any = {
        use: jest.fn(),
      };

      gateway.afterInit(mockServer);

      expect(mockServer.use).toHaveBeenCalled();
    });
  });

  describe('handleConnection', () => {
    beforeEach(() => {
      mockSocket.data.user = mockUser;
    });

    it('should track connection in Redis', async () => {
      await gateway.handleConnection(mockSocket);

      expect(redisService.set).toHaveBeenCalledWith(
        'ws:connection:tenant-123:user-123',
        'socket-123',
        300,
      );
    });

    it('should join user to personal room', async () => {
      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('tenant:tenant-123:user:user-123');
    });

    it('should emit connected event', async () => {
      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', expect.objectContaining({
        message: 'WebSocket connection established',
        timestamp: expect.any(Number),
      }));
    });
  });

  describe('handleDisconnect', () => {
    beforeEach(() => {
      mockSocket.data.user = mockUser;
    });

    it('should remove connection from Redis', async () => {
      await gateway.handleDisconnect(mockSocket);

      expect(redisService.del).toHaveBeenCalledWith(
        'ws:connection:tenant-123:user-123',
      );
    });

    it('should handle disconnect without user gracefully', async () => {
      const socketWithoutUser = { ...mockSocket, data: {} } as unknown as Socket;

      await expect(gateway.handleDisconnect(socketWithoutUser)).resolves.not.toThrow();
      expect(redisService.del).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinRca', () => {
    beforeEach(() => {
      mockSocket.data.user = mockUser;
    });

    it('should join tenant-scoped room', async () => {
      await gateway.handleJoinRca(mockSocket, 'rca-456');

      expect(mockSocket.join).toHaveBeenCalledWith('tenant:tenant-123:rca:rca-456');
    });

    it('should emit user-joined event to other room members', async () => {
      await gateway.handleJoinRca(mockSocket, 'rca-456');

      expect(mockSocket.to).toHaveBeenCalledWith('tenant:tenant-123:rca:rca-456');
      expect(mockSocket.emit).toHaveBeenCalledWith('user-joined', expect.objectContaining({
        userId: 'user-123',
        email: 'user@example.com',
        timestamp: expect.any(Number),
      }));
    });

    it('should confirm room join to client', async () => {
      await gateway.handleJoinRca(mockSocket, 'rca-456');

      expect(mockSocket.emit).toHaveBeenCalledWith('room-joined', expect.objectContaining({
        roomName: 'tenant:tenant-123:rca:rca-456',
        rcaId: 'rca-456',
        timestamp: expect.any(Number),
      }));
    });
  });

  describe('handleLeaveRca', () => {
    beforeEach(() => {
      mockSocket.data.user = mockUser;
    });

    it('should leave tenant-scoped room', async () => {
      await gateway.handleLeaveRca(mockSocket, 'rca-456');

      expect(mockSocket.leave).toHaveBeenCalledWith('tenant:tenant-123:rca:rca-456');
    });

    it('should emit user-left event to other room members', async () => {
      await gateway.handleLeaveRca(mockSocket, 'rca-456');

      expect(mockSocket.to).toHaveBeenCalledWith('tenant:tenant-123:rca:rca-456');
    });
  });

  describe('emitToRcaRoom', () => {
    it('should emit event to tenant-scoped RCA room', () => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      const testData = { message: 'test' };
      gateway.emitToRcaRoom('tenant-123', 'rca-456', 'rca-updated', testData);

      expect(gateway.server.to).toHaveBeenCalledWith('tenant:tenant-123:rca:rca-456');
      expect(gateway.server.emit).toHaveBeenCalledWith('rca-updated', expect.objectContaining({
        message: 'test',
        timestamp: expect.any(Number),
      }));
    });
  });

  describe('emitToUser', () => {
    it('should emit event to specific user room', () => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      const testData = { notification: 'test' };
      gateway.emitToUser('tenant-123', 'user-789', 'notification', testData);

      expect(gateway.server.to).toHaveBeenCalledWith('tenant:tenant-123:user:user-789');
      expect(gateway.server.emit).toHaveBeenCalledWith('notification', expect.objectContaining({
        notification: 'test',
        timestamp: expect.any(Number),
      }));
    });
  });

  describe('emitToTenant', () => {
    it('should emit event to all tenant rooms', () => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      const testData = { announcement: 'test' };
      gateway.emitToTenant('tenant-123', 'announcement', testData);

      expect(gateway.server.to).toHaveBeenCalledWith('tenant:tenant-123:*');
      expect(gateway.server.emit).toHaveBeenCalledWith('announcement', expect.objectContaining({
        announcement: 'test',
        timestamp: expect.any(Number),
      }));
    });
  });

  describe('Authentication Middleware', () => {
    it('should authenticate valid JWT token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockDecodedToken);

      const next = jest.fn();
      const mockServer: any = {
        use: jest.fn((middleware) => {
          middleware(mockSocket, next);
        }),
      };

      gateway.afterInit(mockServer);

      // Wait for async middleware
      await new Promise(process.nextTick);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.data.user).toEqual({
        userId: 'user-123',
        tenantId: 'tenant-123',
        role: 'rca_owner',
        email: 'user@example.com',
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject connection without token', async () => {
      const socketWithoutToken = {
        ...mockSocket,
        handshake: { auth: {} },
      } as unknown as Socket;

      const next = jest.fn();
      const mockServer: any = {
        use: jest.fn((middleware) => {
          middleware(socketWithoutToken, next);
        }),
      };

      gateway.afterInit(mockServer);

      // Wait for async middleware
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(new Error('Unauthorized'));
    });

    it('should reject connection with invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const next = jest.fn();
      const mockServer: any = {
        use: jest.fn((middleware) => {
          middleware(mockSocket, next);
        }),
      };

      gateway.afterInit(mockServer);

      // Wait for async middleware
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(new Error('Unauthorized'));
    });
  });
});
