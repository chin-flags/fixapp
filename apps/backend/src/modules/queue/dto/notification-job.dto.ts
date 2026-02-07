import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class NotificationJobDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // 'assignment', 'approval', 'overdue'

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsObject()
  metadata!: Record<string, any>;
}
