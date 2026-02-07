import { SnakeNamingStrategy } from './snake-naming.strategy';

describe('SnakeNamingStrategy', () => {
  let strategy: SnakeNamingStrategy;

  beforeEach(() => {
    strategy = new SnakeNamingStrategy();
  });

  describe('tableName', () => {
    it('should convert class name to snake_case plural', () => {
      expect(strategy.tableName('User', '')).toBe('users');
      expect(strategy.tableName('RcaInvestigation', '')).toBe('rca_investigations');
      expect(strategy.tableName('AuditLog', '')).toBe('audit_logs');
    });

    it('should use custom name if provided', () => {
      expect(strategy.tableName('User', 'custom_users')).toBe('custom_users');
    });
  });

  describe('columnName', () => {
    it('should convert property name to snake_case', () => {
      expect(strategy.columnName('firstName', '', [])).toBe('first_name');
      expect(strategy.columnName('createdAt', '', [])).toBe('created_at');
      expect(strategy.columnName('tenantId', '', [])).toBe('tenant_id');
    });

    it('should use custom name if provided', () => {
      expect(strategy.columnName('firstName', 'custom_name', [])).toBe(
        'custom_name',
      );
    });

    it('should handle embedded prefixes', () => {
      // The TypeORM SnakeNamingStrategy concatenates embedded prefixes without separators
      // This is expected behavior for embedded entities
      expect(strategy.columnName('street', '', ['address'])).toBe(
        'addressstreet',
      );
    });
  });

  describe('relationName', () => {
    it('should convert relation name to snake_case', () => {
      expect(strategy.relationName('userProfile')).toBe('user_profile');
      expect(strategy.relationName('rcaInvestigation')).toBe(
        'rca_investigation',
      );
    });
  });

  describe('joinColumnName', () => {
    it('should create proper foreign key column names', () => {
      expect(strategy.joinColumnName('user', 'id')).toBe('user_id');
      expect(strategy.joinColumnName('tenant', 'id')).toBe('tenant_id');
      expect(strategy.joinColumnName('rcaInvestigation', 'id')).toBe(
        'rca_investigation_id',
      );
    });
  });
});
