import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../password/password.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly tenantContext: TenantContextService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const tenant = this.tenantContext.getCurrentTenant();
    if (!tenant) {
      throw new UnauthorizedException('No tenant context available');
    }

    const user = await this.usersService.findByEmail(tenant.id, email);

    if (!user || user.status !== 'active') {
      return null;
    }

    const isValid = await this.passwordService.verify(
      password,
      user.passwordHash,
    );
    return isValid ? user : null;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRY') || '30m') as any,
    });

    const refreshToken = await this.createRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    // Hash the refresh token to compare with stored hash
    const tokenHash = await bcrypt.hash(refreshToken, 1);

    // Find the refresh token in database
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      // Clean up expired token
      await this.refreshTokenRepository.remove(storedToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.usersService.findById(storedToken.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Rotate refresh token (delete old, create new)
    await this.refreshTokenRepository.remove(storedToken);

    // Generate new tokens
    return this.login(user);
  }

  async logout(userId: string): Promise<void> {
    // Remove all refresh tokens for this user
    await this.refreshTokenRepository.delete({ userId });
  }

  private async createRefreshToken(user: User): Promise<string> {
    // Generate a random token
    const token = this.generateRandomToken();

    // Hash the token before storing
    const tokenHash = await bcrypt.hash(token, 10);

    // Calculate expiration
    const expiryDays = parseInt(
      this.configService
        .get<string>('JWT_REFRESH_EXPIRY', '7d')
        .replace('d', ''),
      10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Store in database
    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  private generateRandomToken(): string {
    // Generate a secure random token (32 bytes = 256 bits)
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
