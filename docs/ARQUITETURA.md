# 🏗️ Arquitetura do Projeto

## Visão Geral

O Sistema de Gestão para Bar e Restaurante de Hotel é uma aplicação monolítica construída com tecnologias modernas, seguindo arquitetura em camadas com separação de responsabilidades clara.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│         Admin Dashboard | Client Tablet | Kitchen Ops       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  HTTP(S) + WebSocket
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Backend API (NestJS + TypeScript)              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 HTTP Controllers                     │   │
│  │  (Auth, Users, Categories, Orders, Payments, etc)  │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │            Service Layer (Lógica Negocial)         │   │
│  │  - AuthService                                      │   │
│  │  - OrderService                                     │   │
│  │  - PaymentService                                   │   │
│  │  - ReportService                                    │   │
│  │  - WebhookService                                   │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │        Repository Layer (Data Access)              │   │
│  │        (PrismaORM + Database Queries)              │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │       Cross-Cutting Concerns                        │   │
│  │  - Guards (JWT, Role-based)                         │   │
│  │  - Interceptors (Logging, Transform)               │   │
│  │  - Pipes (Validation, Transform)                   │   │
│  │  - Filters (Exception Handling)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    PostgreSQL         Redis/Cache        Webhooks/n8n
    Database           (Sessions,          (Automations,
    (Persistence)      Real-time ops)      Notifications)
```

## Estrutura de Pastas

```
apps/backend/
├── src/
│   ├── modules/              # Módulos de negócio (features)
│   │   ├── auth/            # Autenticação e autorização
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── users/           # Gestão de usuários
│   │   ├── categories/      # Categorias do menu
│   │   ├── menu-items/      # Itens do menu
│   │   ├── tables/          # Gestão de mesas
│   │   ├── orders/          # Pedidos (core)
│   │   ├── payments/        # Pagamentos
│   │   ├── reports/         # Relatórios e analytics
│   │   ├── webhooks/        # Integrações e webhooks
│   │   └── audit-logs/      # Logs de auditoria
│   │
│   ├── common/              # Código compartilhado
│   │   ├── decorators/      # Decoradores custom
│   │   ├── guards/          # Guards globais
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Interceptadores
│   │   ├── pipes/           # Pipes de validação
│   │   ├── entities/        # DTOs e entities compartilhadas
│   │   └── utils/           # Funções utilitárias
│   │
│   ├── config/              # Configurações da app
│   │   └── index.ts         # Validação de env vars
│   │
│   ├── database/            # Camada de dados
│   │   ├── database.service.ts
│   │   └── database.module.ts
│   │
│   ├── app.module.ts        # Módulo raiz
│   └── main.ts              # Entry point
│
├── prisma/
│   ├── schema.prisma        # Definição do banco de dados
│   └── seed.ts              # Dados iniciais
│
├── test/
│   ├── jest-e2e.json
│   └── e2e/
│
└── package.json
```

## Decisões Arquiteturais

### 1. **Monorepo com Workspace**
- ✅ Compartilhamento fácil de tipos TypeScript
- ✅ Dependências gerenciadas centralmente
- ✅ Builds coordenados
- ℹ️ Frontend, Backend e Mobile em apps separados

### 2. **Estrutura por Features (Modules)**
- ✅ Escalabilidade: Cada módulo é independente
- ✅ Manutenção: Fácil encontrar relacionado
- ✅ Testes: Isolamento de dependências
- ✅ Lazy loading: Carregamento sob demanda

### 3. **Service Layer Pattern**
- Controllers → Services → Repositories → Database
- Controllers: Lidam com HTTP e validação
- Services: Lógica de negócio
- Repositories: Acesso a dados (abstraído pelo Prisma)

### 4. **JWT para Autenticação**
```
Client → POST /auth/login (email + password)
Server → Valida credenciais + JWT signed
Client → Requisições com token no header Authorization
Server → Valida token com JWT Guard
```

### 5. **Validação em Múltiplas Camadas**

```typescript
// 1. DTO level (class-validator)
class CreateOrderDto {
  @IsString()
  @MinLength(1)
  tableId: string;

  @IsArray()
  @ArrayMinSize(1)
  items: OrderItemDto[];
}

// 2. Pipe level (transform + validate)
@Post()
async create(@Body() dto: CreateOrderDto) {
  // DTO já foi validado
  return this.orderService.create(dto);
}

// 3. Service level (business rules)
async create(dto: CreateOrderDto) {
  // Validar regras de negócio
  const table = await this.db.table.findUnique(dto.tableId);
  if (!table) throw new NotFoundException();
}
```

### 6. **Error Handling Centralizado**

```typescript
// Exception Filter global
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Padronizar resposta de erro
    // Log automático
    // Ocultar informações sensíveis em produção
  }
}
```

### 7. **Real-time com WebSockets**
- Gateway WebSocket para atualizações em tempo real
- Redis para broadcast entre instâncias
- Eventos: order.updated, order.prepared, payment.confirmed

### 8. **Caching Strategy**
- **Session Cache (Redis)**: Tokens JWT, dados de usuário
- **Data Cache**: Cardápio (TTL: 1 hora), mesas (TTL: 5 min)
- **Invalidação**: Automática em updates

### 9. **Auditoria e Compliance**
- Todos os usuários logados auditados
- Mudanças em dados críticos registradas
- GDPR-compliant data handling

### 10. **Integrações (n8n)**
- Webhooks disparados em eventos-chave
- n8n orquestra workflows:
  - Notificações (email, SMS, Telegram)
  - Relatórios automáticos
  - Backups programados
  - Integrações com sistemas externos

## Fluxos Principais

### Fluxo de Autenticação

```
1. Cliente envia credenciais → POST /auth/login
2. Backend valida com bcrypt
3. JWT assinado é retornado
4. Cliente armazena JWT (localStorage/sessionStorage)
5. Requisições futuras incluem JWT no header
6. Guard valida JWT e injeta user no contexto
```

### Fluxo de Pedido

```
1. Cliente seleciona itens → POST /orders (com tableId)
2. OrderService cria pedido
3. WebSocket notifica cozinha/bar (real-time)
4. Webhook dispara para n8n (notificar garçom)
5. Kitchen atualiza status → PUT /orders/:id
6. WebSocket atualiza cliente (status change)
7. Pagamento → POST /payments
8. Pedido marcado como COMPLETED
9. Webhook dispara para n8n (confirmar entrega)
```

### Fluxo de Relatório

```
1. Admin acessa /reports
2. ReportService consulta agregações
3. Redis cache se houver hit
4. Senão, Prisma consulta banco com agregações
5. Resultado armazenado em cache
6. Retorna dados para visualização
7. Webhook programado envia relátórios diários via n8n
```

## Padrões de Código

### Naming Conventions
- **Arquivos**: kebab-case (order-service.ts)
- **Classes**: PascalCase (OrderService)
- **Métodos/Props**: camelCase (createOrder)
- **Constantes**: UPPER_SNAKE_CASE (DEFAULT_TTL)

### Separação de Responsabilidades

```typescript
// ❌ ERRADO: Logic misturada
@Post()
async createOrder(@Body() dto: CreateOrderDto) {
  const order = new Order(dto);
  
  // Validação
  if (!order.items.length) throw new Error();
  
  // Cálculo
  order.total = order.items.reduce((s, i) => s + i.price, 0);
  
  // Persistência
  await this.db.order.create(order);
  
  // Webhook
  this.webhook.send('order.created', order);
  
  return order;
}

// ✅ CORRETO: Responsabilidades separadas
@Post()
async createOrder(@Body() dto: CreateOrderDto) {
  return this.orderService.create(dto);
}

// Service
class OrderService {
  async create(dto: CreateOrderDto): Promise<Order> {
    this.validateOrder(dto);
    const order = await this.calculateAndSave(dto);
    await this.notifyStakeholders(order);
    return order;
  }
}
```

### Dependency Injection

```typescript
@Injectable()
export class OrderService {
  constructor(
    private readonly db: DatabaseService,      // Injected
    private readonly priceService: PriceService,
    @Inject(WEBHOOK_PROVIDER) 
    private readonly webhook: WebhookService,
  ) {}
}
```

## Segurança

- **JWT**: Tokens com expiration
- **CORS**: Whitelist de domínios
- **Helmet**: Proteção de headers HTTP
- **Bcrypt**: Hashing de senhas (rounds: 10)
- **Validation**: class-validator previne injection
- **Rate Limiting**: Por IP e usuário
- **Audit Logs**: Todas as ações críticas registradas

## Performance

- **Prisma Query Optimization**: Índices no schema
- **N+1 Prevention**: Eager loading com `include/select`
- **Caching**: Redis para dados quentes
- **Pagination**: Endpoints listam com limite
- **Compression**: Gzip automático

## Testes

- **Unit Tests**: Services e utilities com Jest
- **Integration Tests**: Controllers com Supertest
- **E2E Tests**: Fluxos completos
- **Coverage Goal**: >80%

---

**Última atualização**: 13 de Janeiro de 2024
