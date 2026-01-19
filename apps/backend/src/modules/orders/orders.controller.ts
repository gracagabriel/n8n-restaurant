// ==========================================
// Orders Controller
// ==========================================

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { EventsService } from '../events/events.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';
import { OrderStatus } from '@prisma/client';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Criar novo pedido
   * POST /api/orders
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo pedido' })
  async create(
    @Body() body: { tableId: string; notes?: string },
    @Request() req: any,
  ) {
    const order = await this.ordersService.create({
      tableId: body.tableId,
      userId: req.user.id,
      notes: body.notes,
    });

    // Disparar webhook
    await this.eventsService.onOrderCreated(order);

    return order;
  }

  /**
   * Listar todos os pedidos
   * GET /api/orders
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    const statusEnum = status ? (status as OrderStatus) : undefined;
    return this.ordersService.findAll(skipNum, takeNum, statusEnum, tableId);
  }

  /**
   * Obter pedido por ID
   * GET /api/orders/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter pedido por ID' })
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  /**
   * Atualizar status do pedido
   * PUT /api/orders/:id/status
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER', 'KITCHEN', 'BAR')
  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const order = await this.ordersService.findById(id);
    const oldStatus = order.status;

    const updated = await this.ordersService.updateStatus(id, body.status);

    // Disparar webhook
    await this.eventsService.onOrderStatusUpdated(updated, oldStatus);

    return updated;
  }

  /**
   * Adicionar item ao pedido
   * POST /api/orders/:id/items
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar item ao pedido' })
  async addItem(
    @Param('id') id: string,
    @Body() body: { menuItemId: string; quantity: number },
  ) {
    return this.ordersService.addItem(id, body.menuItemId, body.quantity);
  }

  /**
   * Remover item do pedido
   * DELETE /api/orders/:id/items/:itemId
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover item do pedido' })
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.ordersService.removeItem(id, itemId);
  }

  /**
   * Calcular total do pedido
   * GET /api/orders/:id/total
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/total')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calcular total do pedido' })
  async calculateTotal(@Param('id') id: string) {
    const total = await this.ordersService.calculateTotal(id);
    return { orderId: id, total };
  }

  /**
   * Cancelar pedido
   * PUT /api/orders/:id/cancel
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar pedido' })
  async cancel(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    const cancelled = await this.ordersService.cancel(id);

    // Disparar webhook
    await this.eventsService.onOrderCancelled(cancelled);

    return cancelled;
  }
}
