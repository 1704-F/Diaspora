import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentTenant } from '@/shared/decorators/current-tenant.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview',
    description:
      'Get aggregated statistics for members, finances, projects, events, contributions, and recent activities',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview retrieved successfully',
    type: DashboardOverviewDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No tenant access' })
  async getOverview(
    @CurrentTenant() tenantId: string,
  ): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(tenantId);
  }
}
