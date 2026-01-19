# 🍽️ Fase 4: Orders & Payments - Guia Prático Passo a Passo

> **Pré-requisito**: Você completou a Fase 3 (Controllers de Domínio) com sucesso ✅

**Tempo estimado**: 5-6 horas  
**Resultado final**: Gestão completa de pedidos, itens de pedido e pagamentos com rastreamento de status

---

## 📋 Índice

1. [Passo 1: Orders Service](#passo-1-orders-service)
2. [Passo 2: Orders Controller](#passo-2-orders-controller)
3. [Passo 3: Order Items Service](#passo-3-order-items-service)
4. [Passo 4: Payments Service](#passo-4-payments-service)
5. [Passo 5: Payments Controller](#passo-5-payments-controller)
6. [Passo 6: Integração e Importação](#passo-6-integração-e-importação)
7. [Passo 7: Testar Endpoints](#passo-7-testar-endpoints)

---

## PASSO 1️⃣: Orders Service

Serviço para gerenciar pedidos do restaurante (criação, listagem, atualização de status, etc).

### 1.1 - Criar arquivo `orders.service.ts`

**Caminho:**
```bash
mkdir -p C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\orders
```

**Arquivo:** `orders.service.ts`

```typescript
// ==========================================
// Orders Service
// ==========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

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
        status: 'PENDING',
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
            menuItem: true,
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
    status?: string,
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
            menuItem: true,
          },
        },
        payment: true,
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
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
              },
            },
          },
        },
        payment: true,
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
  async updateStatus(id: string, status: string) {
    const order = await this.findById(id);

    // Validar transições de status permitidas
    const validTransitions: { [key: string]: string[] } = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED', 'CANCELLED'],
      SERVED: ['PAID', 'CANCELLED'],
      PAID: [],
      CANCELLED: [],
    };

    if (
      !validTransitions[order.status] ||
      !validTransitions[order.status].includes(status)
    ) {
      throw new BadRequestException(
        `Não é possível mudar de ${order.status} para ${status}`,
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
            menuItem: true,
          },
        },
        payment: true,
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
          menuItem: true,
        },
      });
    }

    // Criar novo item
    return this.prisma.orderItem.create({
      data: {
        orderId,
        menuItemId,
        quantity,
        price: menuItem.price,
      },
      include: {
        menuItem: true,
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
    const order = await this.findById(id);

    const total = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return total;
  }

  /**
   * Cancelar pedido
   */
  async cancel(id: string) {
    const order = await this.findById(id);

    if (['PAID', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Não é possível cancelar este pedido');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
```

### 1.2 - Criar arquivo `orders.module.ts`

```typescript
// ==========================================
// Orders Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrdersService } from './orders.service';

@Module({
  imports: [DatabaseModule],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

---

## PASSO 2️⃣: Orders Controller

Controller com endpoints REST para pedidos.

### 2.1 - Criar arquivo `orders.controller.ts`

```typescript
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
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
    return this.ordersService.create({
      tableId: body.tableId,
      userId: req.user.id,
      notes: body.notes,
    });
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
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
  ) {
    return this.ordersService.findAll(skip, take, status, tableId);
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
    return this.ordersService.updateStatus(id, body.status);
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
    return this.ordersService.cancel(id);
  }
}
```

### 2.2 - Atualizar `orders.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

---

## PASSO 3️⃣: Order Items Service

Serviço para gerenciar itens dentro de um pedido (já está parcialmente implementado no Orders Service, mas vamos criar um serviço específico para mais flexibilidade).

### 3.1 - Adicionar métodos ao `orders.service.ts`

Os métodos `addItem` e `removeItem` já estão no Orders Service acima. Não é necessário criar um serviço separado pois a lógica está integrada.

---

## PASSO 4️⃣: Payments Service

Serviço para gerenciar pagamentos dos pedidos.

### 4.1 - Criar arquivo `payments.service.ts`

**Caminho:**
```bash
mkdir -p C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\payments
```

**Arquivo:** `payments.service.ts`

```typescript
// ==========================================
// Payments Service
// ==========================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

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

    // Calcular total do pedido
    const total = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Validar se o valor do pagamento é válido
    if (data.amount <= 0) {
      throw new BadRequestException('Valor do pagamento deve ser maior que zero');
    }

    if (data.amount > total) {
      throw new BadRequestException(
        `Valor do pagamento não pode exceder o total do pedido (R$ ${total})`,
      );
    }

    // Validar método de pagamento
    const validMethods = ['CASH', 'CARD', 'TRANSFER', 'PIX'];
    if (!validMethods.includes(data.method)) {
      throw new BadRequestException(
        `Método de pagamento inválido. Use: ${validMethods.join(', ')}`,
      );
    }

    // Criar pagamento
    const payment = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method,
        notes: data.notes || '',
        status: 'PENDING',
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
  async findAll(skip: number = 0, take: number = 20, status?: string) {
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
                menuItem: true,
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

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Apenas pagamentos pendentes podem ser confirmados');
    }

    // Atualizar pagamento e pedido
    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        paidAt: new Date(),
      },
    });

    // Atualizar status do pedido para PAID
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PAID' },
    });

    return updatedPayment;
  }

  /**
   * Cancelar pagamento
   */
  async cancel(id: string) {
    const payment = await this.findById(id);

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Apenas pagamentos pendentes podem ser cancelados');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'CANCELLED' },
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
            items: {
              include: {
                menuItem: true,
              },
            },
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
        status: 'CONFIRMED',
      },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;
    const byMethod = payments.reduce(
      (acc, p) => {
        acc[p.method] = (acc[p.method] || 0) + p.amount;
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
```

### 4.2 - Criar arquivo `payments.module.ts`

```typescript
// ==========================================
// Payments Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

---

## PASSO 5️⃣: Payments Controller

Controller com endpoints REST para pagamentos.

### 5.1 - Criar arquivo `payments.controller.ts`

```typescript
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
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Pagamentos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
    return this.paymentsService.create(body);
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
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAll(skip, take, status);
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
    return this.paymentsService.confirm(id);
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
  async cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id);
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
```

### 5.2 - Atualizar `payments.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

---

## PASSO 6️⃣: Integração e Importação

### 6.1 - Atualizar `app.module.ts`

Importe os novos módulos de Orders e Payments:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Módulos existentes
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { TablesModule } from './modules/tables/tables.module';

// Novos módulos Fase 4
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    MenuItemsModule,
    TablesModule,
    OrdersModule,        // ← Novo
    PaymentsModule,      // ← Novo
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## PASSO 7️⃣: Testar Endpoints

### 7.1 - Compilar e Iniciar o Servidor

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend
npm start
```

Você deverá ver:
```
[Nest] 12345 - 01/19/2026, 4:30:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 01/19/2026, 4:30:02 PM     LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 12345 - 01/19/2026, 4:30:02 PM     LOG [InstanceLoader] AuthModule dependencies initialized
...
[Nest] 12345 - 01/19/2026, 4:30:03 PM     LOG [NestApplication] Nest application successfully started
```

### 7.2 - Acessar Swagger

Abra em seu navegador:
```
http://localhost:3000/api/docs
```

### 7.3 - Fluxo de Teste Completo

**1. Login para obter token:**
```bash
POST /api/auth/login
{
  "email": "admin@restaurant.local",
  "password": "admin123"
}
```

Salve o `accessToken` retornado.

**2. Obter mesa disponível:**
```bash
GET /api/tables?status=AVAILABLE
Authorization: Bearer {seu_token}
```

Salve o `id` da mesa.

**3. Criar pedido:**
```bash
POST /api/orders
Authorization: Bearer {seu_token}
{
  "tableId": "{id_da_mesa}",
  "notes": "Sem cebola"
}
```

Salve o `id` do pedido.

**4. Adicionar itens ao pedido:**
```bash
POST /api/orders/{id_do_pedido}/items
Authorization: Bearer {seu_token}
{
  "menuItemId": "{id_do_item_menu}",
  "quantity": 2
}
```

**5. Atualizar status do pedido:**
```bash
PUT /api/orders/{id_do_pedido}/status
Authorization: Bearer {seu_token}
{
  "status": "CONFIRMED"
}
```

Status válidos: `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `SERVED` → `PAID`

**6. Calcular total do pedido:**
```bash
GET /api/orders/{id_do_pedido}/total
Authorization: Bearer {seu_token}
```

**7. Criar pagamento:**
```bash
POST /api/payments
Authorization: Bearer {seu_token}
{
  "orderId": "{id_do_pedido}",
  "amount": {valor_total},
  "method": "CARD",
  "notes": "Aprovado"
}
```

Métodos válidos: `CASH`, `CARD`, `TRANSFER`, `PIX`

**8. Confirmar pagamento:**
```bash
PUT /api/payments/{id_do_pagamento}/confirm
Authorization: Bearer {seu_token}
```

---

## ✅ Checklist Fase 4

- [ ] Orders Service criado com todos os métodos
- [ ] Orders Controller criado com todos os endpoints
- [ ] Payments Service criado com todos os métodos
- [ ] Payments Controller criado com todos os endpoints
- [ ] Módulos importados em `app.module.ts`
- [ ] Servidor compila sem erros
- [ ] Consegue fazer login via Swagger
- [ ] Consegue criar pedido via Swagger
- [ ] Consegue adicionar itens ao pedido
- [ ] Consegue atualizar status do pedido
- [ ] Consegue criar pagamento
- [ ] Consegue confirmar pagamento
- [ ] Status HTTP corretos (201 criar, 200 ok, 404 not found)
- [ ] Validações funcionando (valores negativos, itens não existentes, etc)
- [ ] Teste fluxo completo: pedido → pagamento → confirmação

---

## 📊 Resumo de Endpoints Fase 4

### Orders (13 endpoints)
| Método | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| POST | `/api/orders` | ✅ | ANY | ➜ |
| GET | `/api/orders` | ✅ | ANY | ➜ |
| GET | `/api/orders/:id` | ✅ | ANY | ➜ |
| PUT | `/api/orders/:id/status` | ✅ | KITCHEN, BAR, MANAGER, ADMIN | ➜ |
| POST | `/api/orders/:id/items` | ✅ | ANY | ➜ |
| DELETE | `/api/orders/:id/items/:itemId` | ✅ | ANY | ➜ |
| GET | `/api/orders/:id/total` | ✅ | ANY | ➜ |
| PUT | `/api/orders/:id/cancel` | ✅ | MANAGER, ADMIN | ➜ |

### Payments (8 endpoints)
| Método | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| POST | `/api/payments` | ✅ | WAITER, MANAGER, ADMIN | ➜ |
| GET | `/api/payments` | ✅ | WAITER, MANAGER, ADMIN | ➜ |
| GET | `/api/payments/:id` | ✅ | ANY | ➜ |
| PUT | `/api/payments/:id/confirm` | ✅ | WAITER, MANAGER, ADMIN | ➜ |
| PUT | `/api/payments/:id/cancel` | ✅ | MANAGER, ADMIN | ➜ |
| GET | `/api/payments/order/:orderId` | ✅ | ANY | ➜ |
| GET | `/api/payments/summary` | ✅ | MANAGER, ADMIN | ➜ |

**Total: 21 novos endpoints**

---

## 🎯 Próxima Fase

Após completar Fase 4, você pode:

1. **Fase 5**: Integração com n8n para automações (webhooks, notificações)
2. **Fase 6**: Dashboard Admin (gráficos, analytics, relatórios)
3. **Fase 7**: Frontend com Next.js (telas de pedidos, cardápio, checkout)

---

## 📝 Notas Importantes

1. **Transições de Status**: Um pedido só pode transicionar entre status válidos. Veja `OrdersService.updateStatus()`
2. **Cálculo de Total**: O total é calculado multiplicando `price * quantity` de cada item
3. **Validações de Pagamento**: Não é possível pagar mais que o total do pedido
4. **Métodos de Pagamento**: PIX, CARD, CASH e TRANSFER
5. **Autorização**: Diferentes roles têm diferentes permissões (ADMIN vê tudo, WAITER só cria)

---

**Desenvolvido com ❤️ para seu sucesso**
