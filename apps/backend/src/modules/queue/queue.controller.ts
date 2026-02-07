import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// TODO: Add RBAC guards when implemented in Story 1.4
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/queues')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // TODO: Add @Roles('super_admin', 'tenant_admin') when RBAC is implemented
  @Get('health')
  async getQueueHealth() {
    const health = await this.queueService.getQueueHealth();

    return {
      status: 'success',
      data: health,
      timestamp: new Date().toISOString(),
    };
  }

  // TODO: Add @Roles('super_admin', 'tenant_admin') when RBAC is implemented
  @Get(':queueName/failed')
  async getFailedJobs(
    @Param('queueName') queueName: 'emails' | 'documents' | 'notifications',
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startIndex = start ? parseInt(start, 10) : 0;
    const endIndex = end ? parseInt(end, 10) : 10;

    const failedJobs = await this.queueService.getFailedJobs(
      queueName,
      startIndex,
      endIndex,
    );

    return {
      status: 'success',
      data: failedJobs,
      count: failedJobs.length,
      timestamp: new Date().toISOString(),
    };
  }

  // TODO: Add @Roles('super_admin', 'tenant_admin') when RBAC is implemented
  @Post(':queueName/retry/:jobId')
  @HttpCode(HttpStatus.OK)
  async retryFailedJob(
    @Param('queueName') queueName: 'emails' | 'documents' | 'notifications',
    @Param('jobId') jobId: string,
  ) {
    await this.queueService.retryFailedJob(queueName, jobId);

    return {
      status: 'success',
      message: `Job ${jobId} in queue ${queueName} has been retried`,
      timestamp: new Date().toISOString(),
    };
  }
}
