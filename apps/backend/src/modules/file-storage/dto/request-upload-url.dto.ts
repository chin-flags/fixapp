import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsNumber()
  @Min(1)
  @Max(26214400) // 25MB max
  fileSize!: number;

  @IsString()
  @IsOptional()
  resourceType?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;
}
