# 🍽️ Fase 3: Controllers de Domínio - Guia Prático Passo a Passo

> **Pré-requisito**: Você completou a Fase 2 (Autenticação) com sucesso ✅

**Tempo estimado**: 4-5 horas  
**Resultado final**: 3 domínios com CRUD completo, autenticação e autorização

---

## 📋 Índice

1. [Passo 1: Categories Service](#passo-1-categories-service)
2. [Passo 2: Categories Controller](#passo-2-categories-controller)
3. [Passo 3: MenuItems Service](#passo-3-menuitems-service)
4. [Passo 4: MenuItems Controller](#passo-4-menuitems-controller)
5. [Passo 5: Tables Service](#passo-5-tables-service)
6. [Passo 6: Tables Controller](#passo-6-tables-controller)
7. [Passo 7: Testar Endpoints](#passo-7-testar-endpoints)

---

## PASSO 1️⃣: Categories Service

Serviço para gerenciar categorias de menu (ex: Bebidas, Pratos, Sobremesas).

### 1.1 - Criar arquivo `categories.service.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\categories
```

Crie `categories.service.ts`:

```typescript
// ==========================================
// Categories Service
// ==========================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar nova categoria
   */
  async create(data: { name: string; description?: string }) {
    // Verificar se categoria já existe
    const existing = await this.prisma.category.findUnique({
      where: { name: data.name },
    });
    
    if (existing) {
      throw new ConflictException('Categoria já existe com este nome');
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description || '',
      },
    });
  }

  /**
   * Listar todas as categorias
   */
  async findAll(skip: number = 0, take: number = 10) {
    return this.prisma.category.findMany({
      skip,
      take,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter categoria por ID
   */
  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Atualizar categoria
   */
  async update(id: string, data: { name?: string; description?: string }) {
    const category = await this.findById(id);

    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });
  }

  /**
   * Deletar categoria
   */
  async delete(id: string) {
    const category = await this.findById(id);

    // Verificar se tem itens associados
    if (category.items.length > 0) {
      throw new ConflictException('Não é possível deletar categoria com itens associados');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Contar itens da categoria
   */
  async countItems(id: string): Promise<number> {
    return this.prisma.menuItem.count({
      where: { categoryId: id },
    });
  }
}
```

### 1.2 - Criar arquivo `categories.module.ts`

```typescript
// ==========================================
// Categories Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CategoriesService } from './categories.service';

@Module({
  imports: [DatabaseModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

---

## PASSO 2️⃣: Categories Controller

Controller com endpoints REST para categorias.

### 2.1 - Criar arquivo `categories.controller.ts`

```typescript
// ==========================================
// Categories Controller
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Categorias')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Criar nova categoria
   * POST /api/categories
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova categoria' })
  async create(@Body() body: { name: string; description?: string }) {
    return this.categoriesService.create(body);
  }

  /**
   * Listar todas as categorias
   * GET /api/categories
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.categoriesService.findAll(skip, take);
  }

  /**
   * Obter categoria por ID
   * GET /api/categories/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  async findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  /**
   * Atualizar categoria
   * PUT /api/categories/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.categoriesService.update(id, body);
  }

  /**
   * Deletar categoria
   * DELETE /api/categories/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar categoria' })
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
```

### 2.2 - Atualizar `categories.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

---

## PASSO 3️⃣: MenuItems Service

Serviço para gerenciar itens do cardápio.

### 3.1 - Criar arquivo `menu-items.service.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\menu-items
```

```typescript
// ==========================================
// Menu Items Service
// ==========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar novo item de menu
   */
  async create(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    image?: string;
  }) {
    // Verificar se categoria existe
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || '',
        price: data.price,
        image: data.image || '',
        categoryId: data.categoryId,
      },
    });
  }

  /**
   * Listar itens do menu
   */
  async findAll(skip: number = 0, take: number = 20, categoryId?: string) {
    return this.prisma.menuItem.findMany({
      skip,
      take,
      where: categoryId ? { categoryId } : {},
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter item por ID
   */
  async findById(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }

    return item;
  }

  /**
   * Atualizar item
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      image?: string;
    },
  ) {
    const item = await this.findById(id);

    // Se mudar de categoria, validar
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  /**
   * Deletar item
   */
  async delete(id: string) {
    const item = await this.findById(id);

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  /**
   * Listar itens por categoria
   */
  async findByCategory(categoryId: string) {
    return this.prisma.menuItem.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
    });
  }
}
```

### 3.2 - Criar arquivo `menu-items.module.ts`

```typescript
// ==========================================
// Menu Items Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MenuItemsService } from './menu-items.service';

@Module({
  imports: [DatabaseModule],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
```

---

## PASSO 4️⃣: MenuItems Controller

### 4.1 - Criar arquivo `menu-items.controller.ts`

```typescript
// ==========================================
// Menu Items Controller
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Itens do Cardápio')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  /**
   * Criar novo item do menu
   * POST /api/menu-items
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo item do cardápio' })
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      price: number;
      categoryId: string;
      image?: string;
    },
  ) {
    return this.menuItemsService.create(body);
  }

  /**
   * Listar itens do menu
   * GET /api/menu-items
   */
  @Get()
  @ApiOperation({ summary: 'Listar itens do cardápio' })
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.menuItemsService.findAll(skip, take, categoryId);
  }

  /**
   * Obter item por ID
   * GET /api/menu-items/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter item do cardápio por ID' })
  async findById(@Param('id') id: string) {
    return this.menuItemsService.findById(id);
  }

  /**
   * Atualizar item
   * PUT /api/menu-items/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar item do cardápio' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      image?: string;
    },
  ) {
    return this.menuItemsService.update(id, body);
  }

  /**
   * Deletar item
   * DELETE /api/menu-items/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar item do cardápio' })
  async delete(@Param('id') id: string) {
    return this.menuItemsService.delete(id);
  }

  /**
   * Listar itens por categoria
   * GET /api/menu-items/category/:categoryId
   */
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Listar itens por categoria' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.menuItemsService.findByCategory(categoryId);
  }
}
```

### 4.2 - Atualizar `menu-items.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
```

---

## PASSO 5️⃣: Tables Service

Serviço para gerenciar mesas do restaurante.

### 5.1 - Criar arquivo `tables.service.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\tables
```

```typescript
// ==========================================
// Tables Service
// ==========================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar nova mesa
   */
  async create(data: { number: number; capacity: number; location?: string }) {
    // Verificar se mesa já existe
    const existing = await this.prisma.table.findUnique({
      where: { number: data.number },
    });

    if (existing) {
      throw new ConflictException('Mesa com este número já existe');
    }

    return this.prisma.table.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        location: data.location || '',
        status: 'AVAILABLE',
      },
    });
  }

  /**
   * Listar todas as mesas
   */
  async findAll(skip: number = 0, take: number = 10, status?: string) {
    return this.prisma.table.findMany({
      skip,
      take,
      where: status ? { status } : {},
      include: {
        orders: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  /**
   * Obter mesa por ID
   */
  async findById(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }

    return table;
  }

  /**
   * Atualizar mesa
   */
  async update(id: string, data: { number?: number; capacity?: number; location?: string; status?: string }) {
    const table = await this.findById(id);

    return this.prisma.table.update({
      where: { id },
      data,
      include: {
        orders: true,
      },
    });
  }

  /**
   * Deletar mesa
   */
  async delete(id: string) {
    const table = await this.findById(id);

    // Verificar se tem pedidos ativos
    const activeOrders = table.orders.filter(o => o.status !== 'COMPLETED');
    if (activeOrders.length > 0) {
      throw new ConflictException('Não é possível deletar mesa com pedidos ativos');
    }

    return this.prisma.table.delete({
      where: { id },
    });
  }

  /**
   * Marcar mesa como ocupada
   */
  async markOccupied(id: string) {
    const table = await this.findById(id);

    return this.prisma.table.update({
      where: { id },
      data: { status: 'OCCUPIED' },
    });
  }

  /**
   * Marcar mesa como disponível
   */
  async markAvailable(id: string) {
    const table = await this.findById(id);

    return this.prisma.table.update({
      where: { id },
      data: { status: 'AVAILABLE' },
    });
  }
}
```

### 5.2 - Criar arquivo `tables.module.ts`

```typescript
// ==========================================
// Tables Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TablesService } from './tables.service';

@Module({
  imports: [DatabaseModule],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
```

---

## PASSO 6️⃣: Tables Controller

### 6.1 - Criar arquivo `tables.controller.ts`

```typescript
// ==========================================
// Tables Controller
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Mesas')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  /**
   * Criar nova mesa
   * POST /api/tables
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova mesa' })
  async create(
    @Body() body: { number: number; capacity: number; location?: string },
  ) {
    return this.tablesService.create(body);
  }

  /**
   * Listar todas as mesas
   * GET /api/tables
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas as mesas' })
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @Query('status') status?: string,
  ) {
    return this.tablesService.findAll(skip, take, status);
  }

  /**
   * Obter mesa por ID
   * GET /api/tables/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter mesa por ID' })
  async findById(@Param('id') id: string) {
    return this.tablesService.findById(id);
  }

  /**
   * Atualizar mesa
   * PUT /api/tables/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar mesa' })
  async update(
    @Param('id') id: string,
    @Body() body: { number?: number; capacity?: number; location?: string; status?: string },
  ) {
    return this.tablesService.update(id, body);
  }

  /**
   * Deletar mesa
   * DELETE /api/tables/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar mesa' })
  async delete(@Param('id') id: string) {
    return this.tablesService.delete(id);
  }

  /**
   * Marcar mesa como ocupada
   * PUT /api/tables/:id/occupy
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/occupy')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mesa como ocupada' })
  async markOccupied(@Param('id') id: string) {
    return this.tablesService.markOccupied(id);
  }

  /**
   * Marcar mesa como disponível
   * PUT /api/tables/:id/release
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/release')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mesa como disponível' })
  async markAvailable(@Param('id') id: string) {
    return this.tablesService.markAvailable(id);
  }
}
```

### 6.2 - Atualizar `tables.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
```

---

## PASSO 7️⃣: Importar Módulos e Testar

### 7.1 - Atualizar `app.module.ts`

Adicione os três novos módulos:

```typescript
import { CategoriesModule } from './modules/categories/categories.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { TablesModule } from './modules/tables/tables.module';

@Module({
  imports: [
    // ... módulos existentes
    AuthModule,
    CategoriesModule,
    MenuItemsModule,
    TablesModule,
  ],
  // ...
})
export class AppModule {}
```

### 7.2 - Compilar e Iniciar

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend
rm dist -r -Force 2>$null
npx tsc
node dist/main.js
```

### 7.3 - Testar Endpoints

Abra http://localhost:3000/api/docs para testar no Swagger ou use PowerShell:

```powershell
# Exemplo: Criar categoria
$body = @{
    name = "Bebidas"
    description = "Bebidas diversas"
} | ConvertTo-Json

$token = "seu_token_aqui"

Invoke-WebRequest `
  -Uri "http://localhost:3000/api/categories" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

## ✅ Checklist Fase 3

Use o arquivo `CHECKLIST_FASE_3.md` para acompanhar seu progresso!

---

## 🎯 Próxima Fase

Após completar Fase 3, você pode:

1. **Fase 4**: Implementar Pedidos (Orders) e Pagamentos
2. **Fase 5**: Integração com n8n para automações
3. **Fase 6**: Dashboard Admin + Frontend

---

**Desenvolvido com ❤️ para seu sucesso**
