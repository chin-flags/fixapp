import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track authenticated users by user ID
    if (req.user && req.user.userId) {
      return `user:${req.user.userId}`;
    }
    // Track unauthenticated requests by IP
    return `ip:${req.ip}`;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest();

    // Authenticated users: 1,000 requests/hour
    if (request.user) {
      return 1000;
    }

    // Unauthenticated: 100 requests/hour
    return 100;
  }

  protected async getTtl(context: ExecutionContext): Promise<number> {
    // 1 hour in milliseconds
    return 3600000;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}
