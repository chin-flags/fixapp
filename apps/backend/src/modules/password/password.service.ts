import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Hash a password using bcrypt with 10 salt rounds
   * @param password Plain text password to hash
   * @returns Promise resolving to hashed password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify a password against a hash
   * @param password Plain text password to verify
   * @param hash Hashed password to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      // If comparison fails (invalid hash format, etc.), return false
      return false;
    }
  }
}
