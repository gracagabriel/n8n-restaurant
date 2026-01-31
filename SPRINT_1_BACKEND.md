# 🔧 Sprint 1: Backend - WebSocket Gateway e Endpoints

> **Fase**: 6  
> **Sprint**: 1 de 6  
> **Tempo Estimado**: 2-3 horas  
> **Data Início**: 31/01/2026  
> **Status**: 🔄 Em Progresso

---

## 📋 Objetivos Sprint 1

Implementar no backend NestJS:
1. ✅ WebSocket Gateway (Socket.io)
2. ✅ Endpoints REST para Admin
3. ✅ Guards de autenticação e autorização
4. ✅ Testes básicos

---

## 🛠️ TAREFA 1: Instalar Dependências WebSocket

### 1.1 - Adicionar Socket.io ao backend

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend

npm install @nestjs/websockets @nestjs/socket.io socket.io socket.io-adapter
npm install --save-dev @types/socket.io
```

**Verificar instalação:**
```bash
npm list @nestjs/websockets @nestjs/socket.io socket.io
```

---

## 🔌 TAREFA 2: Criar WebSocket Gateway

### 2.1 - Criar arquivo `events.gateway.ts`

**Caminho**: `src/gateways/events.gateway.ts`

```bash
mkdir -p src/gateways
```

**Arquivo**: `src/gateways/events.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/admin',
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, Socket>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Notificar que cliente conectou
    this.server.emit('client:connected', {
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);

    // Notificar que cliente desconectou
    this.server.emit('client:disconnected', {
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  /**
   * Event: order:created
   * Emitido quando novo pedido é criado
   */
  emitOrderCreated(order: any) {
    this.logger.log(`Broadcasting order:created - Order #${order.orderNumber}`);
    this.server.emit('order:created', {
      order,
      timestamp: new Date(),
    });
  }

  /**
   * Event: order:status-changed
   * Emitido quando status do pedido muda
   */
  emitOrderStatusChanged(order: any, oldStatus: string) {
    this.logger.log(
      `Broadcasting order:status-changed - Order #${order.orderNumber} (${oldStatus} → ${order.status})`,
    );
    this.server.emit('order:status-changed', {
      order,
      oldStatus,
      newStatus: order.status,
      timestamp: new Date(),
    });
  }

  /**
   * Event: order:completed
   * Emitido quando pedido é completado
   */
  emitOrderCompleted(order: any) {
    this.logger.log(`Broadcasting order:completed - Order #${order.orderNumber}`);
    this.server.emit('order:completed', {
      order,
      timestamp: new Date(),
    });
  }

  /**
   * Event: dashboard:metrics
   * Emitido quando métricas do dashboard mudam
   */
  emitDashboardMetrics(metrics: any) {
    this.logger.log(`Broadcasting dashboard:metrics`);
    this.server.emit('dashboard:metrics', {
      metrics,
      timestamp: new Date(),
    });
  }

  /**
   * Event: kds:update
   * Emitido quando KDS precisa atualizar
   */
  emitKdsUpdate(orders: any[]) {
    this.logger.log(`Broadcasting kds:update - ${orders.length} orders`);
    this.server.emit('kds:update', {
      orders,
      timestamp: new Date(),
    });
  }

  /**
   * Obter número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Broadcast para room específica
   */
  broadcastToRoom(room: string, event: string, data: any) {
    this.logger.log(`Broadcasting to room ${room}: ${event}`);
    this.server.to(room).emit(event, data);
  }

  /**
   * Enviar para cliente específico
   */
  sendToClient(clientId: string, event: string, data: any) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, data);
    }
  }
}
```

### 2.2 - Criar arquivo `events.module.ts`

**Arquivo**: `src/gateways/events.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsGatewayModule {}
```

### 2.3 - Atualizar `app.module.ts`

Adicionar import do módulo de gateway:

```typescript
import { EventsGatewayModule } from './gateways/events.module';

@Module({
  imports: [
    // ... outros imports
    EventsGatewayModule,
  ],
  // ...
})
export class AppModule {}
```

---

## 🔐 TAREFA 3: Criar Guards de Autenticação Admin

### 3.1 - Criar arquivo `is-admin.guard.ts`

**Caminho**: `src/guards/is-admin.guard.ts`

```bash
mkdir -p src/guards
```

**Arquivo**: `src/guards/is-admin.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user && user.role === 'ADMIN';
  }
}
```

### 3.2 - Criar arquivo `is-manager.guard.ts`

**Arquivo**: `src/guards/is-manager.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user && (user.role === 'MANAGER' || user.role === 'ADMIN');
  }
}
```

### 3.3 - Criar arquivo `is-kitchen.guard.ts`

**Arquivo**: `src/guards/is-kitchen.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsKitchenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return (
      user &&
      (user.role === 'KITCHEN' ||
        user.role === 'ADMIN' ||
        user.role === 'MANAGER')
    );
  }
}
```

---

## 📊 TAREFA 4: Criar Endpoints REST Admin

### 4.1 - Criar arquivo `admin.controller.ts`

**Caminho**: `src/modules/admin/admin.controller.ts`

```bash
mkdir -p src/modules/admin
```

**Arquivo**: `src/modules/admin/admin.controller.ts`

```typescript
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
```

### 4.2 - Criar arquivo `admin.service.ts`

**Arquivo**: `src/modules/admin/admin.service.ts`

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
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
          items: {
            include: {
              menuItem: true,
            },
          },
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
          items: {
            include: {
              menuItem: true,
            },
          },
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
          status,
          ...(status === 'PREPARING' && order.status === 'PENDING'
            ? { preparedAt: new Date() }
            : {}),
          ...(status === 'READY' && !order.preparedAt
            ? { preparedAt: new Date() }
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
```

### 4.3 - Criar arquivo `admin.module.ts`

**Arquivo**: `src/modules/admin/admin.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../database/database.module';
import { EventsGatewayModule } from '../../gateways/events.module';

@Module({
  imports: [DatabaseModule, EventsGatewayModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
```

### 4.4 - Atualizar `app.module.ts`

Adicionar AdminModule:

```typescript
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // ... outros imports
    AdminModule,
  ],
  // ...
})
export class AppModule {}
```

---

## ✅ TAREFA 5: Testar Implementação

### 5.1 - Iniciar Backend

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend
npm run start:dev
```

**Verificar logs:**
- ✅ "WebSocket Gateway initialized"
- ✅ "All endpoints registered"
- ✅ Sem erros de compilação

### 5.2 - Testar Endpoints no Postman

**1. Login (obter token)**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

**2. Dashboard Metrics**
```
GET http://localhost:3000/api/admin/dashboard/metrics
Authorization: Bearer <TOKEN>
```

**3. Dashboard Revenue**
```
GET http://localhost:3000/api/admin/dashboard/revenue?days=7&period=day
Authorization: Bearer <TOKEN>
```

**4. KDS Orders**
```
GET http://localhost:3000/api/admin/kds/orders
Authorization: Bearer <TOKEN>
```

**5. Tables Status**
```
GET http://localhost:3000/api/admin/tables
Authorization: Bearer <TOKEN>
```

---

## 📊 Checklist Sprint 1

- [ ] Dependências WebSocket instaladas
- [ ] EventsGateway criado e funcionando
- [ ] EventsModule criado
- [ ] Guards de autorização criados (Admin, Manager, Kitchen)
- [ ] AdminController criado com todos os endpoints
- [ ] AdminService criado com lógica de negócio
- [ ] AdminModule criado e importado em AppModule
- [ ] Backend compilando sem erros
- [ ] Endpoints testados no Postman
- [ ] WebSocket funcionando (veremos em Sprint 2)

---

## 📝 Próximo Passo

Sprint 2: **Frontend Setup - Criar projeto Next.js e estrutura inicial**

---

**Começar Sprint 1 agora?** Vamos implementar tudo isso! 🚀
