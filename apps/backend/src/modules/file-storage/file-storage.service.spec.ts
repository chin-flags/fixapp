import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { File } from './entities/file.entity';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let fileRepository: jest.Mocked<Repository<File>>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        NODE_ENV: 'development',
        AWS_S3_BUCKET: 'fixapp-files',
        AWS_REGION: 'us-east-1',
        AWS_S3_ENDPOINT: 'http://localhost:4566',
      };
      return config[key];
    }),
  };

  const mockFileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    fileRepository = module.get(getRepositoryToken(File));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateUploadUrl', () => {
    it('should generate presigned upload URL for valid photo', async () => {
      const result = await service.generateUploadUrl(
        'tenant-123',
        'user-123',
        'test.jpg',
        'image/jpeg',
        5 * 1024 * 1024, // 5MB
        'rcas',
        'rca-123',
      );

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('fileId');
      expect(result).toHaveProperty('s3Key');
      expect(result.s3Key).toMatch(/^tenant-123\/rcas\/rca-123\/.+\.jpg$/);
    });

    it('should generate presigned upload URL for valid document', async () => {
      const result = await service.generateUploadUrl(
        'tenant-123',
        'user-123',
        'report.pdf',
        'application/pdf',
        20 * 1024 * 1024, // 20MB
        'rcas',
        'rca-123',
      );

      expect(result).toHaveProperty('uploadUrl');
      expect(result.s3Key).toMatch(/^tenant-123\/rcas\/rca-123\/.+\.pdf$/);
    });

    it('should reject unsupported file type', async () => {
      await expect(
        service.generateUploadUrl(
          'tenant-123',
          'user-123',
          'test.txt',
          'text/plain',
          1024,
          'rcas',
          'rca-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject photo exceeding 10MB limit', async () => {
      await expect(
        service.generateUploadUrl(
          'tenant-123',
          'user-123',
          'large.jpg',
          'image/jpeg',
          11 * 1024 * 1024, // 11MB
          'rcas',
          'rca-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject document exceeding 25MB limit', async () => {
      await expect(
        service.generateUploadUrl(
          'tenant-123',
          'user-123',
          'large.pdf',
          'application/pdf',
          26 * 1024 * 1024, // 26MB
          'rcas',
          'rca-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate S3 key without resource type/id', async () => {
      const result = await service.generateUploadUrl(
        'tenant-123',
        'user-123',
        'test.png',
        'image/png',
        1024,
      );

      expect(result.s3Key).toMatch(/^tenant-123\/.+\.png$/);
    });
  });

  describe('generateDownloadUrl', () => {
    it('should generate presigned download URL for existing file', async () => {
      const mockFile = {
        id: 'file-123',
        tenantId: 'tenant-123',
        s3Key: 'tenant-123/rcas/rca-123/file-123.jpg',
        originalFilename: 'test.jpg',
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile as File);

      const result = await service.generateDownloadUrl('file-123', 'tenant-123');

      expect(result).toHaveProperty('downloadUrl');
      expect(mockFileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', tenantId: 'tenant-123' },
      });
    });

    it('should throw NotFoundException for non-existent file', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateDownloadUrl('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent cross-tenant access', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateDownloadUrl('file-123', 'different-tenant'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveFileMetadata', () => {
    it('should save file metadata to database', async () => {
      const mockFile = {
        id: 'file-123',
        tenantId: 'tenant-123',
        s3Key: 'tenant-123/rcas/rca-123/file-123.jpg',
        originalFilename: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        resourceType: 'rcas',
        resourceId: 'rca-123',
        uploadedBy: 'user-123',
      };

      mockFileRepository.create.mockReturnValue(mockFile as File);
      mockFileRepository.save.mockResolvedValue(mockFile as File);

      const result = await service.saveFileMetadata(
        'file-123',
        'tenant-123',
        'user-123',
        'tenant-123/rcas/rca-123/file-123.jpg',
        'test.jpg',
        1024,
        'image/jpeg',
        'rcas',
        'rca-123',
      );

      expect(result).toEqual(mockFile);
      expect(mockFileRepository.create).toHaveBeenCalled();
      expect(mockFileRepository.save).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('getFileMetadata', () => {
    it('should return file metadata for existing file', async () => {
      const mockFile = {
        id: 'file-123',
        tenantId: 'tenant-123',
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile as File);

      const result = await service.getFileMetadata('file-123', 'tenant-123');

      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException for non-existent file', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getFileMetadata('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listFiles', () => {
    it('should list all files for tenant', async () => {
      const mockFiles = [
        { id: 'file-1', tenantId: 'tenant-123' },
        { id: 'file-2', tenantId: 'tenant-123' },
      ];

      mockFileRepository.find.mockResolvedValue(mockFiles as File[]);

      const result = await service.listFiles('tenant-123');

      expect(result).toEqual(mockFiles);
      expect(mockFileRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should list files filtered by resource type and ID', async () => {
      const mockFiles = [{ id: 'file-1', tenantId: 'tenant-123' }];

      mockFileRepository.find.mockResolvedValue(mockFiles as File[]);

      const result = await service.listFiles('tenant-123', 'rcas', 'rca-123');

      expect(result).toEqual(mockFiles);
      expect(mockFileRepository.find).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-123',
          resourceType: 'rcas',
          resourceId: 'rca-123',
        },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('deleteFile', () => {
    it('should soft delete existing file', async () => {
      const mockFile = {
        id: 'file-123',
        tenantId: 'tenant-123',
        originalFilename: 'test.jpg',
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile as File);
      mockFileRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteFile('file-123', 'tenant-123');

      expect(mockFileRepository.softDelete).toHaveBeenCalledWith('file-123');
    });

    it('should throw NotFoundException when deleting non-existent file', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteFile('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
