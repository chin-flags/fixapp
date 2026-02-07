import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class PdfJobDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string; // 'rca-report', 'fishbone-diagram'

  @IsString()
  @IsNotEmpty()
  rcaId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class ExcelJobDto {
  @IsString()
  @IsNotEmpty()
  exportType!: string; // 'rca-list', 'analytics'

  @IsObject()
  filters!: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}
