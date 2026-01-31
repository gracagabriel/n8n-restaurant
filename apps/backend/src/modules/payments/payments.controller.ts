// ==========================================
// Payments Controller
// ==========================================

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { EventsService } from '../events/events.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';
import { PaymentStatus } from '@prisma/client';

@ApiTags('Pagamentos')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Criar novo pagamento
   * POST /api/payments
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo pagamento' })
  async create(
    @Body()
    body: {
      orderId: string;
      amount: number;
      method: string;
      notes?: string;
    },
  ) {
    const payment = await this.paymentsService.create(body);

    // Disparar webhook
    await this.eventsService.onPaymentCreated(payment);

    return payment;
  }

  /**
   * Listar todos os pagamentos
   * GET /api/payments
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    const statusEnum = status ? (status as PaymentStatus) : undefined;
    return this.paymentsService.findAll(skipNum, takeNum, statusEnum);
  }

  /**
   * Obter pagamento por ID
   * GET /api/payments/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter pagamento por ID' })
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  /**
   * Confirmar pagamento
   * PUT /api/payments/:id/confirm
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  @Put(':id/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar pagamento' })
  async confirm(@Param('id') id: string) {
    const payment = await this.paymentsService.findById(id);
    const confirmed = await this.paymentsService.confirm(id);

    // Disparar webhook
    await this.eventsService.onPaymentConfirmed(confirmed);

    return confirmed;
  }

  /**
   * Cancelar pagamento
   * PUT /api/payments/:id/cancel
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar pagamento' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const payment = await this.paymentsService.findById(id);
    const cancelled = await this.paymentsService.cancel(id);

    // Disparar webhook
    await this.eventsService.onPaymentFailed(cancelled, body.reason || '');

    return cancelled;
  }

  /**
   * Obter pagamento por Order ID
   * GET /api/payments/order/:orderId
   */
  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter pagamento por ID do pedido' })
  async findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  /**
   * Obter resumo de pagamentos
   * GET /api/payments/summary?startDate=2024-01-01&endDate=2024-12-31
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Get('summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter resumo de pagamentos por período' })
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.paymentsService.getSummary(start, end);
  }
}
