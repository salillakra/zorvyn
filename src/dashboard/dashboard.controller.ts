import {
  DefaultValuePipe,
  Controller,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireRoles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get high-level financial summary.' })
  @ApiOkResponse({ description: 'Dashboard summary returned.' })
  @Get('summary')
  @RequireRoles('analyst', 'admin')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @ApiOperation({ summary: 'Get month-wise income/expense trends.' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 6 })
  @ApiOkResponse({ description: 'Dashboard trends returned.' })
  @Get('trends')
  @RequireRoles('analyst', 'admin')
  getTrends(
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number,
  ) {
    return this.dashboardService.getTrends(months);
  }

  @ApiOperation({ summary: 'Get expense breakdown by category.' })
  @ApiOkResponse({ description: 'Category breakdown returned.' })
  @Get('categories')
  @RequireRoles('analyst', 'admin')
  getCategoryBreakdown() {
    return this.dashboardService.getCategoryBreakdown();
  }

  @ApiOperation({ summary: 'Get most recent transactions (viewer safe).' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'Recent transactions returned.' })
  @Get('recent')
  @RequireRoles('viewer', 'analyst', 'admin')
  getRecent(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.getRecent(limit);
  }
}
