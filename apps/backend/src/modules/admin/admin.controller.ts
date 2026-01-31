import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common';
import { IsManagerGuard } from '../../guards/is-manager.guard';
import { IsKitchenGuard } from '../../guards/is-kitchen.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * Dashboard Metrics
   * GET /admin/dashboard/metrics
   * Acesso: Manager+
   */
  @Get('dashboard/metrics')
  @UseGuards(IsManagerGuard)
  async getDashboardMetrics() {
    this.logger.log('GET /admin/dashboard/metrics');
    return this.adminService.getDashboardMetrics();
  }

  /**
   * Dashboard Revenue
   * GET /admin/dashboard/revenue
   * Acesso: Manager+
   */
  @Get('dashboard/revenue')
  @UseGuards(IsManagerGuard)
  async getRevenue(
    @Query('days') days: string = '7',
    @Query('period') period: string = 'day',
  ) {
    this.logger.log(`GET /admin/dashboard/revenue (days=${days}, period=${period})`);
    return this.adminService.getRevenue(parseInt(days, 10), period);
  }

  /**
   * Dashboard Top Items
   * GET /admin/dashboard/top-items
   * Acesso: Manager+
   */
  @Get('dashboard/top-items')
  @UseGuards(IsManagerGuard)
  async getTopItems(@Query('limit') limit: string = '5') {
    this.logger.log(`GET /admin/dashboard/top-items (limit=${limit})`);
    return this.adminService.getTopItems(parseInt(limit, 10));
  }

  /**
   * KDS Orders
   * GET /admin/kds/orders
   * Acesso: Kitchen+
   */
  @Get('kds/orders')
  @UseGuards(IsKitchenGuard)
  async getKdsOrders(@Query('status') status?: string) {
    this.logger.log(`GET /admin/kds/orders (status=${status || 'all'})`);
    return this.adminService.getKdsOrders(status);
  }

  /**
   * KDS Orders History
   * GET /admin/kds/history
   * Acesso: Kitchen+
   */
  @Get('kds/history')
  @UseGuards(IsKitchenGuard)
  async getKdsHistory() {
    this.logger.log(`GET /admin/kds/history`);
    return this.adminService.getKdsHistory();
  }

  /**
   * Update Order Status (via KDS)
   * PUT /admin/orders/:id/status
   * Acesso: Kitchen+
   */
  @Put('orders/:id/status')
  @UseGuards(IsKitchenGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    this.logger.log(`PUT /admin/orders/${id}/status (${body.status})`);
    return this.adminService.updateOrderStatus(id, body.status);
  }

  /**
   * Get Tables Status
   * GET /admin/tables
   * Acesso: Manager+
   */
  @Get('tables')
  @UseGuards(IsManagerGuard)
  async getTablesStatus() {
    this.logger.log(`GET /admin/tables`);
    return this.adminService.getTablesStatus();
  }

  /**
   * Get Table by ID
   * GET /admin/tables/:id
   * Acesso: Manager+
   */
  @Get('tables/:id')
  @UseGuards(IsManagerGuard)
  async getTableById(@Param('id') id: string) {
    this.logger.log(`GET /admin/tables/${id}`);
    return this.adminService.getTableById(id);
  }
}
