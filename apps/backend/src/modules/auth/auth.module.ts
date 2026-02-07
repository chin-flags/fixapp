import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { PasswordService } from '../password/password.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET must be configured');
        }
        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRY') || '30m') as any,
          },
        };
      },
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PasswordService,
    TenantContextService,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
