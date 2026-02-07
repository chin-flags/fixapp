import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextMiddleware } from './tenant-context.middleware';
import { TenantService } from '../../modules/tenants/tenant.service';
import { TenantContextService } from '../services/tenant-context.service';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let tenantService: TenantService;
  let tenantContextService: TenantContextService;

  const mockTenant: Tenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    subdomain: 'test',
    status: 'active',
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTenantService = {
    findBySubdomain: jest.fn(),
  };

  const mockTenantContextService = {
    run: jest.fn((tenant, callback) => callback()),
  };

  const mockRequest = (options: {
    hostname?: string;
    header?: (name: string) => string | undefined;
  }): any => ({
    hostname: options.hostname || 'localhost',
    header: options.header || jest.fn(),
  });

  const mockResponse = (): Partial<Response> => ({});

  const mockNext: NextFunction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextMiddleware,
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    middleware = module.get<TenantContextMiddleware>(TenantContextMiddleware);
    tenantService = module.get<TenantService>(TenantService);
    tenantContextService = module.get<TenantContextService>(
      TenantContextService,
    );

    jest.clearAllMocks();
  });

  describe('subdomain extraction', () => {
    it('should extract subdomain from production hostname', async () => {
      const req = mockRequest({ hostname: 'acme.fixapp.com' });
      mockTenantService.findBySubdomain.mockResolvedValue(mockTenant);

      await middleware.use(
        req as Request,
        mockResponse() as Response,
        mockNext,
      );

      expect(mockTenantService.findBySubdomain).toHaveBeenCalledWith('acme');
    });

    it('should use X-Tenant-Subdomain header when provided', async () => {
      const req = mockRequest({
        hostname: 'localhost',
        header: jest.fn((name) =>
          name === 'X-Tenant-Subdomain' ? 'test' : undefined,
        ),
      });
      mockTenantService.findBySubdomain.mockResolvedValue(mockTenant);

      await middleware.use(
        req as Request,
        mockResponse() as Response,
        mockNext,
      );

      expect(mockTenantService.findBySubdomain).toHaveBeenCalledWith('test');
    });

    it('should use DEFAULT_TENANT_SUBDOMAIN env variable for localhost', async () => {
      process.env.DEFAULT_TENANT_SUBDOMAIN = 'local';
      const req = mockRequest({ hostname: 'localhost' });
      mockTenantService.findBySubdomain.mockResolvedValue(mockTenant);

      await middleware.use(
        req as Request,
        mockResponse() as Response,
        mockNext,
      );

      expect(mockTenantService.findBySubdomain).toHaveBeenCalledWith('local');
      delete process.env.DEFAULT_TENANT_SUBDOMAIN;
    });

    it('should throw NotFoundException when subdomain cannot be extracted', async () => {
      const req = mockRequest({ hostname: 'fixapp.com' }); // No subdomain

      await expect(
        middleware.use(req as Request, mockResponse() as Response, mockNext),
      ).rejects.toThrow(NotFoundException);
      await expect(
        middleware.use(req as Request, mockResponse() as Response, mockNext),
      ).rejects.toThrow('Tenant subdomain not found');
    });
  });

  describe('tenant lookup', () => {
    it('should throw NotFoundException when tenant not found', async () => {
      const req = mockRequest({ hostname: 'nonexistent.fixapp.com' });
      mockTenantService.findBySubdomain.mockResolvedValue(null);

      await expect(
        middleware.use(req as Request, mockResponse() as Response, mockNext),
      ).rejects.toThrow(NotFoundException);
      await expect(
        middleware.use(req as Request, mockResponse() as Response, mockNext),
      ).rejects.toThrow('Tenant not found');
    });

    it('should throw ForbiddenException when tenant is inactive', async () => {
      const inactiveTenant = { ...mockTenant, status: 'inactive' };
      const req = mockRequest({ hostname: 'test.fixapp.com' });
      mockTenantService.findBySubdomain.mockResolvedValue(inactiveTenant);

      await expect(
        middleware.use(req as Request, mockResponse() as Response, mockNext),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        middleware.use(req as Request, mockResponse() as Response, mockNext),
      ).rejects.toThrow('Tenant is inactive');
    });
  });

  describe('tenant context setting', () => {
    it('should set tenant context and attach to request', async () => {
      const req: any = mockRequest({ hostname: 'test.fixapp.com' });
      mockTenantService.findBySubdomain.mockResolvedValue(mockTenant);

      await middleware.use(req as Request, mockResponse() as Response, mockNext);

      expect(mockTenantContextService.run).toHaveBeenCalledWith(
        mockTenant,
        expect.any(Function),
      );
      expect(req.tenant).toEqual(mockTenant);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
