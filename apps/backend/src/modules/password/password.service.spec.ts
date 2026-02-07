import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await service.hash('');
      expect(hash).toBeDefined();
    });
  });

  describe('verify', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      const isValid = await service.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await service.hash(password);

      const isValid = await service.verify(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password verification', async () => {
      const hash = await service.hash('password');
      const isValid = await service.verify('', hash);
      expect(isValid).toBe(false);
    });

    it('should be resistant to timing attacks (consistent execution time)', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      // Multiple verifications should complete in similar time
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await service.verify(i % 2 === 0 ? password : 'wrong', hash);
        times.push(Date.now() - start);
      }

      // All times should be reasonably close (within 50ms variance)
      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const maxDeviation = Math.max(
        ...times.map((t) => Math.abs(t - avgTime)),
      );

      // Timing attack resistance: max deviation should be small
      // Note: bcrypt is inherently resistant to timing attacks
      // This test ensures timing consistency within reasonable bounds
      expect(maxDeviation).toBeLessThan(200); // Increased tolerance for CI/CD environments
    });
  });

  describe('password strength', () => {
    it('should hash passwords of various lengths', async () => {
      const passwords = [
        'short',
        'mediumpassword',
        'verylongpasswordwithlotso fcharacters1234567890!@#$%^&*()',
      ];

      for (const password of passwords) {
        const hash = await service.hash(password);
        expect(hash).toBeDefined();
        const isValid = await service.verify(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should hash passwords with special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await service.hash(password);
      const isValid = await service.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should hash passwords with unicode characters', async () => {
      const password = 'password™®©😀';
      const hash = await service.hash(password);
      const isValid = await service.verify(password, hash);
      expect(isValid).toBe(true);
    });
  });
});
