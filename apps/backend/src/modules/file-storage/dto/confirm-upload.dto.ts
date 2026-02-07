import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  fileId!: string;

  @IsString()
  @IsNotEmpty()
  s3Key!: string;

  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsNumber()
  @Min(1)
  fileSize!: number;

  @IsString()
  @IsOptional()
  resourceType?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;
}
