// ==========================================
// Payments Service
// ==========================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar novo pagamento
   */
  async create(data: {
    orderId: string;
    amount: number;
    method: string;
    notes?: string;
  }) {
    // Validar se pedido existe
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Calcular total do pedido (em centavos)
    const total = order.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // Validar se o valor do pagamento é válido
    if (data.amount <= 0) {
      throw new BadRequestException('Valor do pagamento deve ser maior que zero');
    }

    if (data.amount > total) {
      throw new BadRequestException(
        `Valor do pagamento não pode exceder o total do pedido (R$ ${(total / 100).toFixed(2)})`,
      );
    }

    // Validar método de pagamento
    const validMethods = Object.values(PaymentMethod);
    if (!validMethods.includes(data.method as PaymentMethod)) {
      throw new BadRequestException(
        `Método de pagamento inválido. Use: ${validMethods.join(', ')}`,
      );
    }

    // Criar pagamento
    const payment = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: Math.round(data.amount), // Garantir que é inteiro (centavos)
        method: data.method as PaymentMethod,
        description: data.notes || undefined,
        status: PaymentStatus.PENDING,
        paidAt: null,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    return payment;
  }

  /**
   * Listar todos os pagamentos
   */
  async findAll(skip: number = 0, take: number = 20, status?: PaymentStatus) {
    return this.prisma.payment.findMany({
      skip,
      take,
      where: status ? { status } : {},
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            tableId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter pagamento por ID
   */
  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            table: true,
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }

  /**
   * Confirmar pagamento
   */
  async confirm(id: string) {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Apenas pagamentos pendentes podem ser confirmados');
    }

    // Atualizar pagamento e pedido
    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    // Atualizar status do pedido para COMPLETED
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED' },
    });

    return updatedPayment;
  }

  /**
   * Cancelar pagamento
   */
  async cancel(id: string) {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Apenas pagamentos pendentes podem ser cancelados');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.FAILED },
    });
  }

  /**
   * Obter pagamento por Order ID
   */
  async findByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado para este pedido');
    }

    return payment;
  }

  /**
   * Calcular resumo de pagamentos por período
   */
  async getSummary(startDate: Date, endDate: Date) {
    const payments = await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.COMPLETED,
      },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;
    const byMethod = payments.reduce(
      (acc, p) => {
        const methodStr = p.method.toString();
        acc[methodStr] = (acc[methodStr] || 0) + p.amount;
        return acc;
      },
      {} as { [key: string]: number },
    );

    return {
      period: { startDate, endDate },
      totalAmount: total,
      totalTransactions: count,
      byMethod,
    };
  }
}
