import { DatabaseModule } from './database.module';

describe('DatabaseModule', () => {
  it('should be defined', () => {
    // Simple test to ensure the module class exists
    // Integration tests with a real database will be in e2e tests
    expect(DatabaseModule).toBeDefined();
    expect(new DatabaseModule()).toBeInstanceOf(DatabaseModule);
  });
});
