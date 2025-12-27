import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to FixApp API - Multi-tenant RCA Platform';
  }
}
