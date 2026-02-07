import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Controller('api/v1/files')
@UseGuards(JwtAuthGuard)
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload-url')
  async requestUploadUrl(
    @Request() req: any,
    @Body() dto: RequestUploadUrlDto,
  ) {
    const { tenantId, userId } = req.user;

    const result = await this.fileStorageService.generateUploadUrl(
      tenantId,
      userId,
      dto.filename,
      dto.contentType,
      dto.fileSize,
      dto.resourceType,
      dto.resourceId,
    );

    return {
      status: 'success',
      data: result,
      message: 'Upload URL generated successfully',
    };
  }

  @Post('confirm-upload')
  @HttpCode(HttpStatus.CREATED)
  async confirmUpload(
    @Request() req: any,
    @Body() dto: ConfirmUploadDto,
  ) {
    const { tenantId, userId } = req.user;

    const file = await this.fileStorageService.saveFileMetadata(
      dto.fileId,
      tenantId,
      userId,
      dto.s3Key,
      dto.filename,
      dto.fileSize,
      dto.contentType,
      dto.resourceType,
      dto.resourceId,
    );

    return {
      status: 'success',
      data: file,
      message: 'File uploaded successfully',
    };
  }

  @Get(':fileId/download-url')
  async getDownloadUrl(
    @Request() req: any,
    @Param('fileId') fileId: string,
  ) {
    const { tenantId } = req.user;

    const result = await this.fileStorageService.generateDownloadUrl(fileId, tenantId);

    return {
      status: 'success',
      data: result,
      message: 'Download URL generated successfully',
    };
  }

  @Get(':fileId')
  async getFileMetadata(
    @Request() req: any,
    @Param('fileId') fileId: string,
  ) {
    const { tenantId } = req.user;

    const file = await this.fileStorageService.getFileMetadata(fileId, tenantId);

    return {
      status: 'success',
      data: file,
    };
  }

  @Get()
  async listFiles(
    @Request() req: any,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
  ) {
    const { tenantId } = req.user;

    const files = await this.fileStorageService.listFiles(
      tenantId,
      resourceType,
      resourceId,
    );

    return {
      status: 'success',
      data: files,
      count: files.length,
    };
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Request() req: any,
    @Param('fileId') fileId: string,
  ) {
    const { tenantId } = req.user;

    await this.fileStorageService.deleteFile(fileId, tenantId);
  }
}
