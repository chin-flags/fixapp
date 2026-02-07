import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string; // user_id (UUID)
  tenantId: string; // tenant_id (UUID)
  email: string; // user email
  role: string; // user role
  locationScope?: string; // Optional location scoping
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Passport automatically verifies JWT signature and expiration
    // This method is called only if token is valid
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Return value is attached to request.user by Passport
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
      ...(payload.locationScope && { locationScope: payload.locationScope }),
    };
  }
}
