// ==========================================
// Orders Service
// ==========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar novo pedido
   */
  async create(data: {
    tableId: string;
    userId: string;
    notes?: string;
  }) {
    // Validar se mesa existe
    const table = await this.prisma.table.findUnique({
      where: { id: data.tableId },
    });

    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }

    // Validar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Gerar número único para o pedido
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.order.create({
      data: {
        orderNumber,
        tableId: data.tableId,
        userId: data.userId,
        notes: data.notes || '',
        status: OrderStatus.PENDING,
      },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  /**
   * Listar todos os pedidos com filtros
   */
  async findAll(
    skip: number = 0,
    take: number = 20,
    status?: OrderStatus,
    tableId?: string,
  ) {
    return this.prisma.order.findMany({
      skip,
      take,
      where: {
        ...(status && { status }),
        ...(tableId && { tableId }),
      },
      include: {
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter pedido por ID
   */
  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  /**
   * Atualizar status do pedido
   */
  async updateStatus(id: string, statusStr: string) {
    const order = await this.findById(id);
    const status = statusStr as OrderStatus;

    // Validar transições de status permitidas
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (
      !validTransitions[order.status] ||
      !validTransitions[order.status].includes(status)
    ) {
      throw new BadRequestException(
        `Não é possível mudar de ${order.status} para ${statusStr}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        table: true,
        user: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
    });
  }

  /**
   * Adicionar item ao pedido
   */
  async addItem(orderId: string, menuItemId: string, quantity: number) {
    const order = await this.findById(orderId);

    // Validar se item de menu existe
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException('Item do menu não encontrado');
    }

    // Se já existe o item no pedido, atualizar quantidade
    const existingItem = await this.prisma.orderItem.findFirst({
      where: {
        orderId,
        menuItemId,
      },
    });

    if (existingItem) {
      return this.prisma.orderItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: {
          item: true,
        },
      });
    }

    // Criar novo item
    return this.prisma.orderItem.create({
      data: {
        orderId,
        menuItemId,
        quantity,
        unitPrice: menuItem.price,
      },
      include: {
        item: true,
      },
    });
  }

  /**
   * Remover item do pedido
   */
  async removeItem(orderId: string, itemId: string) {
    const order = await this.findById(orderId);

    return this.prisma.orderItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Calcular total do pedido
   */
  async calculateTotal(id: string): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const total = order.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    return total;
  }

  /**
   * Cancelar pedido
   */
  async cancel(id: string) {
    const order = await this.findById(id);

    const cancelledStatuses: OrderStatus[] = [OrderStatus.COMPLETED, OrderStatus.CANCELLED];
    if (cancelledStatuses.includes(order.status)) {
      throw new BadRequestException('Não é possível cancelar este pedido');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });
  }
}
