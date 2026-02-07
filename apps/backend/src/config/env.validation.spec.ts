import 'reflect-metadata';
import { validate } from './env.validation';

describe('Environment Validation', () => {
  it('should validate correct environment variables', () => {
    const config = {
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'fixapp_dev',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
    };

    expect(() => validate(config)).not.toThrow();
  });

  it('should throw error for missing NODE_ENV', () => {
    const config = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'fixapp_dev',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
    };

    expect(() => validate(config)).toThrow();
  });

  it('should throw error for missing DB_HOST', () => {
    const config = {
      NODE_ENV: 'development',
      DB_PORT: '5432',
      DB_NAME: 'fixapp_dev',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
    };

    expect(() => validate(config)).toThrow();
  });

  it('should throw error for invalid NODE_ENV', () => {
    const config = {
      NODE_ENV: 'invalid',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'fixapp_dev',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
    };

    expect(() => validate(config)).toThrow();
  });

  it('should convert DB_PORT string to number', () => {
    const config = {
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'fixapp_dev',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
    };

    const result = validate(config);
    expect(typeof result.DB_PORT).toBe('number');
    expect(result.DB_PORT).toBe(5432);
  });
});
