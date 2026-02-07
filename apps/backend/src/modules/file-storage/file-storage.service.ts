import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { File } from './entities/file.entity';

// File size limits in bytes
const SIZE_LIMITS = {
  PHOTO: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
};

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

// File extension mapping
const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export interface UploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  s3Key: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {
    const isLocal = this.configService.get<string>('NODE_ENV') === 'development';

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'fixapp-files';

    // Configure S3 client for LocalStack or AWS
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      ...(isLocal && {
        endpoint: this.configService.get<string>('AWS_S3_ENDPOINT') || 'http://localhost:4566',
        forcePathStyle: true, // Required for LocalStack
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
        },
      }),
    });

    this.logger.log(`FileStorageService initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Generate presigned URL for file upload
   */
  async generateUploadUrl(
    tenantId: string,
    userId: string,
    filename: string,
    contentType: string,
    fileSize: number,
    resourceType?: string,
    resourceId?: string,
  ): Promise<UploadUrlResponse> {
    // Validate file type
    this.validateFileType(contentType);

    // Validate file size
    this.validateFileSize(contentType, fileSize);

    // Generate unique file ID and S3 key
    const fileId = uuidv4();
    const s3Key = this.buildS3Key(tenantId, resourceType, resourceId, fileId, contentType);

    // Generate presigned URL for upload (10 minutes expiry)
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });

    this.logger.log(`Generated upload URL for file: ${filename} (${fileId})`);

    return {
      uploadUrl,
      fileId,
      s3Key,
    };
  }

  /**
   * Generate presigned URL for file download
   */
  async generateDownloadUrl(
    fileId: string,
    tenantId: string,
  ): Promise<DownloadUrlResponse> {
    // Find file in database
    const file = await this.fileRepository.findOne({
      where: { id: fileId, tenantId },
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }

    // Generate presigned URL for download (1 hour expiry)
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.s3Key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    this.logger.log(`Generated download URL for file: ${file.originalFilename} (${fileId})`);

    return {
      downloadUrl,
    };
  }

  /**
   * Save file metadata to database after successful upload
   */
  async saveFileMetadata(
    fileId: string,
    tenantId: string,
    userId: string,
    s3Key: string,
    filename: string,
    fileSize: number,
    contentType: string,
    resourceType?: string,
    resourceId?: string,
  ): Promise<File> {
    const file = this.fileRepository.create({
      id: fileId,
      tenantId,
      s3Key,
      originalFilename: filename,
      fileSize,
      contentType,
      resourceType,
      resourceId,
      uploadedBy: userId,
    });

    await this.fileRepository.save(file);

    this.logger.log(`Saved file metadata: ${filename} (${fileId})`);

    return file;
  }

  /**
   * Get file metadata by ID
   */
  async getFileMetadata(fileId: string, tenantId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, tenantId },
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }

    return file;
  }

  /**
   * List files for a resource
   */
  async listFiles(
    tenantId: string,
    resourceType?: string,
    resourceId?: string,
  ): Promise<File[]> {
    const where: any = { tenantId };

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    return this.fileRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Soft delete a file
   */
  async deleteFile(fileId: string, tenantId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, tenantId },
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }

    await this.fileRepository.softDelete(fileId);

    this.logger.log(`Soft deleted file: ${file.originalFilename} (${fileId})`);
  }

  /**
   * Build S3 key with tenant isolation
   * Format: {tenant_id}/{resource_type}/{resource_id}/{file_id}.{ext}
   */
  private buildS3Key(
    tenantId: string,
    resourceType: string | undefined,
    resourceId: string | undefined,
    fileId: string,
    contentType: string,
  ): string {
    const extension = CONTENT_TYPE_EXTENSIONS[contentType] || 'bin';
    const parts = [tenantId];

    if (resourceType) {
      parts.push(resourceType);
    }

    if (resourceId) {
      parts.push(resourceId);
    }

    parts.push(`${fileId}.${extension}`);

    return parts.join('/');
  }

  /**
   * Validate file type against allowed lists
   */
  private validateFileType(contentType: string): void {
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

    if (!allAllowedTypes.includes(contentType)) {
      throw new BadRequestException(
        `Unsupported file type: ${contentType}. Allowed types: ${allAllowedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Validate file size based on type
   */
  private validateFileSize(contentType: string, fileSize: number): void {
    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(contentType);

    if (isImage && fileSize > SIZE_LIMITS.PHOTO) {
      throw new BadRequestException(
        `Photo size exceeds limit of ${SIZE_LIMITS.PHOTO / (1024 * 1024)}MB`,
      );
    }

    if (isDocument && fileSize > SIZE_LIMITS.DOCUMENT) {
      throw new BadRequestException(
        `Document size exceeds limit of ${SIZE_LIMITS.DOCUMENT / (1024 * 1024)}MB`,
      );
    }
  }
}
