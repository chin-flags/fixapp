import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_NAME!: string;

  @IsString()
  DB_USER!: string;

  @IsString()
  DB_PASSWORD!: string;

  // Security Configuration
  @IsBoolean()
  @IsOptional()
  HELMET_ENABLED?: boolean = true;

  @IsBoolean()
  @IsOptional()
  HELMET_CSP_ENABLED?: boolean = true;

  @IsNumber()
  @IsOptional()
  HELMET_HSTS_MAX_AGE?: number = 31536000;

  @IsBoolean()
  @IsOptional()
  RATE_LIMIT_ENABLED?: boolean = true;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_TTL?: number = 60000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX_REQUESTS?: number = 100;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_AUTH_MAX?: number = 1000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_LOGIN_MAX?: number = 10;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string = 'http://localhost:3000';

  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS?: boolean = true;

  @IsBoolean()
  @IsOptional()
  TLS_ENABLED?: boolean = false;

  @IsString()
  @IsOptional()
  TLS_VERSION?: string = '1.3';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
