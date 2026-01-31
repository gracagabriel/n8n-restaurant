import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: DatabaseService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Obter métricas do dashboard
   */
  async getDashboardMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalOrders = await this.prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      });

      const completedOrders = await this.prisma.order.count({
        where: {
          createdAt: { gte: today },
          status: 'COMPLETED',
        },
      });

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: today },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.items.reduce(
          (itemSum, item) => itemSum + item.unitPrice * item.quantity,
          0,
        );
        return sum + orderTotal;
      }, 0);

      const occupiedTables = await this.prisma.table.count({
        where: { status: 'OCCUPIED' },
      });

      const totalTables = await this.prisma.table.count();

      const avgTime =
        completedOrders > 0
          ? Math.round(
              orders
                .filter((o) => o.completedAt && o.startedAt)
                .reduce((sum, o) => {
                  const diff =
                    new Date(o.completedAt).getTime() -
                    new Date(o.startedAt).getTime();
                  return sum + diff;
                }, 0) /
                completedOrders /
                60000,
            )
          : 0;

      return {
        totalOrders,
        completedOrders,
        pendingOrders: totalOrders - completedOrders,
        totalRevenue,
        occupiedTables,
        totalTables,
        availableTables: totalTables - occupiedTables,
        averageTimeMinutes: avgTime,
      };
    } catch (error) {
      this.logger.error('Error getting dashboard metrics', error);
      throw error;
    }
  }

  /**
   * Obter receita por período
   */
  async getRevenue(days: number = 7, period: string = 'day') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED',
        },
        include: {
          items: true,
        },
      });

      // Agrupar por período
      const grouped: Record<string, number> = {};
      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        let key = '';

        if (period === 'day') {
          key = date.toISOString().split('T')[0];
        } else if (period === 'hour') {
          key = date.toISOString().slice(0, 13);
        }

        const total = order.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        grouped[key] = (grouped[key] || 0) + total;
      });

      return Object.entries(grouped).map(([period, revenue]) => ({
        period,
        revenue,
      }));
    } catch (error) {
      this.logger.error('Error getting revenue', error);
      throw error;
    }
  }

  /**
   * Obter itens mais vendidos
   */
  async getTopItems(limit: number = 5) {
    try {
      const items = await this.prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: {
          quantity: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: limit,
      });

      const topItems = await Promise.all(
        items.map(async (item) => {
          const menuItem = await this.prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
          });

          return {
            id: menuItem.id,
            name: menuItem.name,
            quantity: item._sum.quantity || 0,
            price: menuItem.price,
            revenue: (item._sum.quantity || 0) * menuItem.price,
          };
        }),
      );

      return topItems;
    } catch (error) {
      this.logger.error('Error getting top items', error);
      throw error;
    }
  }

  /**
   * Obter pedidos para KDS
   */
  async getKdsOrders(status?: string) {
    try {
      const where: any = {
        status: {
          in: ['PENDING', 'PREPARING', 'READY'],
        },
      };

      if (status && ['PENDING', 'PREPARING', 'READY'].includes(status)) {
        where.status = status;
      }

      const orders = await this.prisma.order.findMany({
        where,
        include: {
          items: true,
          table: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return orders;
    } catch (error) {
      this.logger.error('Error getting KDS orders', error);
      throw error;
    }
  }

  /**
   * Obter histórico de pedidos completados hoje
   */
  async getKdsHistory() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orders = await this.prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
        include: {
          items: true,
          table: true,
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 20,
      });

      return orders;
    } catch (error) {
      this.logger.error('Error getting KDS history', error);
      throw error;
    }
  }

  /**
   * Atualizar status do pedido via KDS
   */
  async updateOrderStatus(id: string, status: string) {
    try {
      if (!['PENDING', 'PREPARING', 'READY', 'COMPLETED'].includes(status)) {
        throw new Error('Invalid status');
      }

      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order ${id} not found`);
      }

      const oldStatus = order.status;

      const updated = await this.prisma.order.update({
        where: { id },
        data: {
          status: status as any,
          ...(status === 'PREPARING' && order.status === 'PENDING'
            ? { startedAt: new Date() }
            : {}),
          ...(status === 'READY' && !order.startedAt
            ? { startedAt: new Date() }
            : {}),
          ...(status === 'COMPLETED'
            ? { completedAt: new Date() }
            : {}),
        },
        include: {
          items: true,
          table: true,
        },
      });

      // Emit WebSocket event
      this.eventsGateway.emitOrderStatusChanged(updated, oldStatus);

      this.logger.log(
        `Order ${id} status updated: ${oldStatus} → ${status}`,
      );

      return updated;
    } catch (error) {
      this.logger.error(`Error updating order status: ${id}`, error);
      throw error;
    }
  }

  /**
   * Obter status das mesas
   */
  async getTablesStatus() {
    try {
      const tables = await this.prisma.table.findMany({
        include: {
          orders: {
            where: {
              status: { not: 'COMPLETED' },
            },
            take: 1,
          },
        },
        orderBy: [{ area: 'asc' }, { number: 'asc' }],
      });

      return tables.map((table) => ({
        ...table,
        hasActiveOrder: table.orders.length > 0,
      }));
    } catch (error) {
      this.logger.error('Error getting tables status', error);
      throw error;
    }
  }

  /**
   * Obter mesa por ID
   */
  async getTableById(id: string) {
    try {
      const table = await this.prisma.table.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!table) {
        throw new NotFoundException(`Table ${id} not found`);
      }

      return table;
    } catch (error) {
      this.logger.error(`Error getting table ${id}`, error);
      throw error;
    }
  }
}
