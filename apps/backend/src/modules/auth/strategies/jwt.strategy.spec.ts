import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret-key',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const validPayload = {
      sub: 'user-123',
      tenantId: 'tenant-456',
      email: 'test@example.com',
      role: 'team_member',
    };

    it('should validate and return user object when user is active', async () => {
      const mockUser = {
        id: 'user-123',
        tenantId: 'tenant-456',
        email: 'test@example.com',
        role: 'team_member',
        status: 'active',
      };

      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await strategy.validate(validPayload);

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        userId: 'user-123',
        tenantId: 'tenant-456',
        email: 'test@example.com',
        role: 'team_member',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(validPayload)).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const mockUser = {
        id: 'user-123',
        status: 'inactive',
      };

      usersService.findById.mockResolvedValue(mockUser as any);

      await expect(strategy.validate(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should include locationScope in result when present in payload', async () => {
      const payloadWithLocation = {
        ...validPayload,
        locationScope: 'location-789',
      };

      const mockUser = {
        id: 'user-123',
        status: 'active',
      };

      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await strategy.validate(payloadWithLocation);

      expect(result).toHaveProperty('locationScope', 'location-789');
    });
  });
});
