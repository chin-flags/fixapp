import { IsString, IsNotEmpty, IsObject, IsEmail } from 'class-validator';

export class EmailJobDto {
  @IsEmail()
  to!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  template!: string; // 'assignment', 'approval', 'overdue'

  @IsObject()
  data!: Record<string, any>; // Template variables
}
