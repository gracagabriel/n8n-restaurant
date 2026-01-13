# 🎨 Padrões de Código - Guia de Desenvolvimento

## Convenções de Nomenclatura

### Arquivos

```
✅ CORRETO
auth.module.ts              # Module
auth.service.ts             # Service
auth.controller.ts          # Controller
auth.service.spec.ts        # Tests
create-auth.dto.ts          # DTO
jwt.strategy.ts             # Strategy
jwt.guard.ts                # Guard
auth-response.dto.ts        # Response DTO

❌ ERRADO
AuthModule.ts
authService.ts
createAuthDTO.ts
JWT_Strategy.ts
Auth_Response_DTO.ts
```

### Classes

```typescript
// ✅ CORRETO - PascalCase
class AuthService {}
class CreateUserDto {}
class JwtGuard implements CanActivate {}

// ❌ ERRADO
class authService {}
class createUserDTO {}
class jwtGuard {}
```

### Métodos e Propriedades

```typescript
// ✅ CORRETO - camelCase
async createUser(dto: CreateUserDto) {}
async getUserById(id: string) {}
private validatePassword(password: string) {}
readonly maxRetries = 3;
lastLoginTime: Date;

// ❌ ERRADO
async CreateUser() {}
async get_user_by_id() {}
private ValidatePassword() {}
readonly MAX_RETRIES = 3; // Use para constantes globais, não propriedades
```

### Constantes

```typescript
// ✅ CORRETO - UPPER_SNAKE_CASE
const DEFAULT_PAGE_SIZE = 10;
const JWT_EXPIRATION = '24h';
const MAX_LOGIN_ATTEMPTS = 5;

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// ❌ ERRADO
const defaultPageSize = 10;
const jwtExpiration = '24h';
const default_page_size = 10;
```

---

## Estrutura de um Módulo (Feature)

### Template Completo

```
src/modules/orders/
├── orders.module.ts              # Import/export
├── orders.controller.ts          # HTTP handlers
├── orders.service.ts             # Business logic
├── orders.service.spec.ts        # Unit tests
├── dto/
│   ├── create-order.dto.ts       # Input
│   ├── update-order.dto.ts
│   ├── order-response.dto.ts     # Output
│   └── order-item.dto.ts
├── entities/
│   └── order.entity.ts           # Entity class (map Prisma)
├── interfaces/
│   └── order.interface.ts        # Contracts
└── guards/ (se houver)
    └── order-owner.guard.ts      # Access control
```

### Module File

```typescript
// orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '@/database';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // Se outros módulos precisarem
})
export class OrdersModule {}
```

### Service File

```typescript
// orders.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateOrderDto) {
    // Validação de negócio
    const table = await this.db.table.findUnique({
      where: { id: dto.tableId },
    });

    if (!table) {
      throw new NotFoundException(`Mesa ${dto.tableId} não encontrada`);
    }

    if (table.status !== 'AVAILABLE') {
      throw new BadRequestException('Mesa não está disponível');
    }

    // Criar pedido
    return this.db.order.create({
      data: {
        orderNumber: await this.generateOrderNumber(),
        tableId: dto.tableId,
        userId: dto.userId,
        items: {
          create: dto.items,
        },
      },
      include: {
        items: true,
        table: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { item: true },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }

    return order;
  }

  private async generateOrderNumber(): Promise<string> {
    // Lógica de geração
    return `PED-${Date.now()}`;
  }
}
```

### Controller File

```typescript
// orders.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from './dto';
import { JwtGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';

@Controller('orders')
@ApiTags('Orders')
@ApiBearerAuth('bearer')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar pedido' })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado',
    type: OrderResponseDto,
  })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.create({
      ...dto,
      userId: user.id,
    });
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Obter pedido' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Atualizar pedido' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, dto);
  }
}
```

### DTO File

```typescript
// dto/create-order.dto.ts
import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class OrderItemDto {
  @IsString()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

---

## Tratamento de Erros

### Exception Filter Global

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || 'HTTP Exception';
        details = exceptionResponse;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Log em produção
      this.logger.error({
        message: exception.message,
        stack: exception.stack,
        path: request.url,
        method: request.method,
      });
    }

    response.status(status).json({
      success: false,
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        details,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
```

### Uso no main.ts

```typescript
// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## Guards (Autenticação & Autorização)

### JWT Guard

```typescript
// common/guards/jwt.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('JWT inválido');
    }
    return user;
  }
}
```

### Role Guard

```typescript
// common/guards/role.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // Sem requisito de role
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Permissão negada. Roles necessárias: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

### Decorator de Roles

```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### Uso

```typescript
@Controller('admin')
@UseGuards(JwtGuard, RoleGuard)
export class AdminController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getAdminData() {
    // Apenas ADMIN ou MANAGER podem acessar
  }
}
```

---

## Decoradores Customizados

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('profile')
async getProfile(@CurrentUser() user) {
  console.log(user.id, user.email);
}
```

---

## Validação com class-validator

```typescript
// Exemplo completo de DTO
import {
  IsString,
  IsEmail,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsEnum,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve ter letra maiúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve ter número' })
  password: string;

  @IsEnum(['ADMIN', 'USER'])
  role: string;

  @IsNumber()
  @Min(18)
  @Max(120)
  @IsOptional()
  age?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];
}

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;
}
```

---

## Testes

### Service Test Example

```typescript
// orders.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { DatabaseService } from '@/database';
import { CreateOrderDto } from './dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let db: DatabaseService;

  // Mock do banco
  const mockDb = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    table: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  describe('create', () => {
    it('deve criar um pedido com sucesso', async () => {
      const dto: CreateOrderDto = {
        tableId: 'table-1',
        items: [{ menuItemId: 'item-1', quantity: 1 }],
      };

      mockDb.table.findUnique.mockResolvedValue({
        id: 'table-1',
        status: 'AVAILABLE',
      });

      mockDb.order.create.mockResolvedValue({
        id: 'order-1',
        tableId: 'table-1',
        status: 'PENDING',
      });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(mockDb.order.create).toHaveBeenCalled();
    });

    it('deve lançar erro se mesa não existe', async () => {
      mockDb.table.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          tableId: 'invalid',
          items: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se mesa não está disponível', async () => {
      mockDb.table.findUnique.mockResolvedValue({
        id: 'table-1',
        status: 'OCCUPIED', // Ocupada
      });

      await expect(
        service.create({
          tableId: 'table-1',
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

---

## Logging

```typescript
// Usar o logger do NestJS
import { Logger } from '@nestjs/common';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  async create(dto: CreateOrderDto) {
    this.logger.log(`Criando pedido para mesa ${dto.tableId}`);

    try {
      const order = await this.db.order.create({ data: {} });
      this.logger.log(`Pedido criado com ID: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Erro ao criar pedido: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

## Checklist de Qualidade

Antes de fazer commit:

- [ ] ✅ TypeScript compila sem erros
- [ ] ✅ ESLint sem warnings
- [ ] ✅ Prettier formatou o código
- [ ] ✅ Testes passam (>80% coverage)
- [ ] ✅ Swagger documentation atualizado
- [ ] ✅ DTOs com validações
- [ ] ✅ Tratamento de erros apropriado
- [ ] ✅ Sem console.log (usar Logger)
- [ ] ✅ Commits com mensagens descritivas
- [ ] ✅ Code review se houver

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [class-validator](https://github.com/typestack/class-validator)
- [Jest Documentation](https://jestjs.io)
