import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';

describe('TenantService', () => {
  let service: TenantService;
  let repository: Repository<Tenant>;

  const mockTenant: Tenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    subdomain: 'test',
    status: 'active',
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    // Clear cache before each test
    service.clearCache();
    jest.clearAllMocks();
  });

  describe('findBySubdomain', () => {
    it('should return tenant when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findBySubdomain('test');

      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: 'test' },
      });
    });

    it('should return null when tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findBySubdomain('nonexistent');

      expect(result).toBeNull();
    });

    it('should cache tenant after first lookup', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // First call - should query database
      await service.findBySubdomain('test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await service.findBySubdomain('test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after TTL expires', async () => {
      jest.useFakeTimers();
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // First call
      await service.findBySubdomain('test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

      // Advance time beyond cache TTL (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Second call - should query database again
      await service.findBySubdomain('test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('findBySubdomainOrThrow', () => {
    it('should return tenant when found and active', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findBySubdomainOrThrow('test');

      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySubdomainOrThrow('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findBySubdomainOrThrow('nonexistent')).rejects.toThrow(
        'Tenant not found',
      );
    });

    it('should throw ForbiddenException when tenant is inactive', async () => {
      const inactiveTenant = { ...mockTenant, status: 'inactive' };
      mockRepository.findOne.mockResolvedValue(inactiveTenant);

      await expect(service.findBySubdomainOrThrow('test')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findBySubdomainOrThrow('test')).rejects.toThrow(
        'Tenant is inactive',
      );
    });
  });

  describe('createTenant', () => {
    it('should create tenant with provided data', async () => {
      const createData = {
        name: 'New Tenant',
        subdomain: 'new',
      };

      mockRepository.create.mockReturnValue(mockTenant);
      mockRepository.save.mockResolvedValue(mockTenant);

      const result = await service.createTenant(createData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createData,
        status: 'active',
        settings: {},
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });

    it('should use provided status and settings', async () => {
      const createData = {
        name: 'New Tenant',
        subdomain: 'new',
        status: 'pending',
        settings: { key: 'value' },
      };

      mockRepository.create.mockReturnValue(mockTenant);
      mockRepository.save.mockResolvedValue(mockTenant);

      await service.createTenant(createData);

      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('cache management', () => {
    it('should invalidate cache for specific subdomain', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // Populate cache
      await service.findBySubdomain('test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

      // Invalidate cache
      service.invalidateCache('test');

      // Should query database again
      await service.findBySubdomain('test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache entries', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // Populate cache for multiple subdomains
      await service.findBySubdomain('test1');
      await service.findBySubdomain('test2');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);

      // Clear all cache
      service.clearCache();

      // Should query database for both
      await service.findBySubdomain('test1');
      await service.findBySubdomain('test2');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(4);
    });
  });
});
