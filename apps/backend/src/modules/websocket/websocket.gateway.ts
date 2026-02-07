import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  namespace: '/rca',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000, // 25 seconds
  pingTimeout: 20000, // 20 seconds
})
export class RcaGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RcaGateway.name);

  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  // Lifecycle: After gateway initialization
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Authenticate WebSocket connections
    server.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          throw new Error('No authentication token provided');
        }

        // Verify JWT token
        const decoded = await this.jwtService.verifyAsync(token);

        // Attach user data to socket
        socket.data.user = {
          userId: decoded.sub,
          tenantId: decoded.tenantId,
          role: decoded.role,
          email: decoded.email,
        };

        this.logger.debug(`WebSocket authenticated: user ${decoded.sub}`);
        next();
      } catch (err) {
        const error = err as Error;
        this.logger.error(`WebSocket authentication failed: ${error.message}`);
        next(new Error('Unauthorized'));
      }
    });
  }

  // Lifecycle: Client connected
  async handleConnection(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Client connected: ${client.id}, user: ${user.userId}`);

    // Track connection in Redis
    await this.redisService.set(
      `ws:connection:${user.tenantId}:${user.userId}`,
      client.id,
      300, // 5 minute TTL, refreshed on ping
    );

    // Join user to their personal room for direct notifications
    const userRoom = `tenant:${user.tenantId}:user:${user.userId}`;
    client.join(userRoom);

    // Emit connection success
    client.emit('connected', {
      message: 'WebSocket connection established',
      timestamp: Date.now(),
    });
  }

  // Lifecycle: Client disconnected
  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Client disconnected: ${client.id}, user: ${user?.userId}`);

    if (user) {
      // Remove from Redis tracking
      await this.redisService.del(
        `ws:connection:${user.tenantId}:${user.userId}`,
      );
    }
  }

  // Event: Join RCA room
  @SubscribeMessage('join-rca')
  async handleJoinRca(
    @ConnectedSocket() client: Socket,
    @MessageBody() rcaId: string,
  ) {
    const user = client.data.user;

    // TODO: Verify user has access to this RCA via RBAC (Story 1.4 integration)
    // For now, we trust that the user is authenticated and in the correct tenant

    // Construct tenant-scoped room name
    const roomName = `tenant:${user.tenantId}:rca:${rcaId}`;

    // Join room
    client.join(roomName);

    this.logger.debug(`User ${user.userId} joined room: ${roomName}`);

    // Notify other users in the room
    client.to(roomName).emit('user-joined', {
      userId: user.userId,
      email: user.email,
      timestamp: Date.now(),
    });

    // Confirm join to the client
    client.emit('room-joined', {
      roomName,
      rcaId,
      timestamp: Date.now(),
    });
  }

  // Event: Leave RCA room
  @SubscribeMessage('leave-rca')
  async handleLeaveRca(
    @ConnectedSocket() client: Socket,
    @MessageBody() rcaId: string,
  ) {
    const user = client.data.user;
    const roomName = `tenant:${user.tenantId}:rca:${rcaId}`;

    client.leave(roomName);

    this.logger.debug(`User ${user.userId} left room: ${roomName}`);

    // Notify other users
    client.to(roomName).emit('user-left', {
      userId: user.userId,
      email: user.email,
      timestamp: Date.now(),
    });
  }

  // Utility: Emit event to specific RCA room
  emitToRcaRoom(tenantId: string, rcaId: string, event: string, data: any) {
    const roomName = `tenant:${tenantId}:rca:${rcaId}`;

    this.server.to(roomName).emit(event, {
      ...data,
      timestamp: Date.now(),
    });

    this.logger.debug(`Emitted '${event}' to room: ${roomName}`);
  }

  // Utility: Emit notification to specific user
  emitToUser(tenantId: string, userId: string, event: string, data: any) {
    const roomName = `tenant:${tenantId}:user:${userId}`;

    this.server.to(roomName).emit(event, {
      ...data,
      timestamp: Date.now(),
    });

    this.logger.debug(`Emitted '${event}' to user: ${userId}`);
  }

  // Utility: Emit to all users in a tenant
  emitToTenant(tenantId: string, event: string, data: any) {
    // Broadcast to all rooms with this tenant prefix
    const pattern = `tenant:${tenantId}:*`;

    this.server.to(pattern).emit(event, {
      ...data,
      timestamp: Date.now(),
    });

    this.logger.debug(`Emitted '${event}' to tenant: ${tenantId}`);
  }
}
