# 🏗️ Backend - Restaurant Management API

API desenvolvida com NestJS, TypeScript e PostgreSQL com arquitetura modular e testes.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Gerar tipos Prisma
npx prisma generate

# Rodar migrações
npx prisma migrate dev --name init

# Seed do banco
npx prisma db seed

# Iniciar em dev
npm run start:dev

# Acesso Swagger
open http://localhost:3000/api/docs
```

## 📁 Estrutura

```
src/
├── modules/          # Features (Auth, Users, Orders, etc)
├── common/           # Código compartilhado (guards, pipes, decorators)
├── config/           # Configurações e env vars
├── database/         # Prisma service
├── app.module.ts     # Root module
└── main.ts           # Entry point

prisma/
├── schema.prisma     # Definição do banco
└── seed.ts           # Dados iniciais
```

## 🔧 Scripts

```bash
# Desenvolvimento
npm run start:dev       # Dev com hot reload
npm run start:debug     # Debug mode

# Build
npm run build           # Compile TypeScript
npm run start:prod      # Rodar build compilado

# Testes
npm run test            # Unit tests
npm run test:cov        # Com cobertura
npm run test:e2e        # E2E tests

# Code quality
npm run lint            # ESLint
npm run format          # Prettier

# Prisma
npx prisma studio      # UI visual do banco
npx prisma migrate dev # Nova migração
npx prisma db seed     # Re-seed dados
```

## 🗄️ Banco de Dados

### Credenciais Padrão (Dev)

```
Host: localhost (ou postgres se em Docker)
Port: 5432
User: restaurant_user
Password: restaurant_password
Database: restaurant_db
```

### Executar Migrações

```bash
# Ver migrações pendentes
npx prisma migrate status

# Executar migrações
npx prisma migrate dev

# Criar nova migração após mudar schema
npx prisma migrate dev --name descritivo_nome
```

## 🔐 Autenticação

### Credenciais Padrão (após seed)

| Email | Senha | Papel |
|-------|-------|-------|
| admin@restaurant.local | admin123 | ADMIN |
| gerente@restaurant.local | admin123 | MANAGER |
| garcom@restaurant.local | admin123 | WAITER |
| cozinha@restaurant.local | admin123 | KITCHEN |
| bar@restaurant.local | admin123 | BAR |

### Fluxo de Login

```bash
# 1. POST /api/auth/login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.local",
    "password": "admin123"
  }'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@restaurant.local",
    "name": "Administrador",
    "role": "ADMIN"
  }
}

# 2. Usar token em requisições futuras
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🧪 Testes

### Estrutura de Testes

```
src/
└── modules/
    └── users/
        ├── users.service.ts
        └── users.service.spec.ts    # Testes paralelos
```

### Rodar Testes

```bash
# Todos os testes
npm run test

# Watch mode (reexecuta ao salvar)
npm run test:watch

# Com cobertura
npm run test:cov

# Arquivo específico
npm run test -- auth.service

# E2E
npm run test:e2e
```

### Exemplo de Teste

```typescript
describe('OrderService', () => {
  let service: OrderService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrderService, DatabaseService],
    }).compile();

    service = module.get<OrderService>(OrderService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  it('deve criar um pedido', async () => {
    const dto = { tableId: '1', items: [...] };
    const result = await service.create(dto);
    
    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING');
  });
});
```

## 📚 Documentação API (Swagger)

Acesse: http://localhost:3000/api/docs

Todos os endpoints estão documentados com:
- Descrição
- Parâmetros
- Response examples
- Status codes

### Endpoints Principais (Fase 1)

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/health` - Health check
- `POST /api/categories` - Criar categoria (Admin)
- `GET /api/categories` - Listar categorias
- `POST /api/menu-items` - Criar item
- `GET /api/menu-items` - Listar itens
- `POST /api/tables` - Criar mesa
- `GET /api/tables` - Listar mesas
- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Detalhe pedido
- `PATCH /api/orders/:id` - Atualizar status

## 🐛 Debugging

### VS Code

Adicione ao `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "restart": true,
      "protocol": "inspector",
      "port": 9229,
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Logs

```typescript
// Injete o logger do NestJS
import { Logger } from '@nestjs/common';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  async create(dto) {
    this.logger.log('Criando pedido...', dto);
    this.logger.error('Erro ao criar', error);
    this.logger.warn('Aviso', details);
  }
}
```

## 🔄 WebSockets (Real-time)

Implantado com Socket.IO para atualizações em tempo real:

```typescript
// Cliente (Frontend)
const socket = io('http://localhost:3000');

socket.on('order.created', (data) => {
  console.log('Novo pedido:', data);
});

socket.on('order.status.updated', (data) => {
  console.log('Pedido atualizado:', data);
});

// Server (NestJS)
@WebSocketGateway()
export class OrdersGateway {
  @SubscribeMessage('order.create')
  async handleOrderCreate(client, payload) {
    // Lógica
    client.emit('order.created', result);
  }
}
```

## 🚨 Troubleshooting

### Erro: "Cannot find module '@nestjs/common'"

```bash
npm install
npm install --save @nestjs/common
```

### Erro: "Connection refused" ao banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Reiniciar
docker-compose restart postgres

# Aguardar e tentar novamente
```

### Erro na migração: "Relation does not exist"

```bash
# Reset do banco (cuidado: perde dados!)
npx prisma migrate reset

# Ou criar fresh
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init
npx prisma db seed
```

### Prisma não gera tipos

```bash
# Regenerar
npx prisma generate

# Verificar schema
npx prisma validate
```

## 📚 Referências

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma ORM](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [PostgreSQL](https://www.postgresql.org/docs)
- [JWT](https://jwt.io)

## 📝 Licença

MIT

---

**Desenvolvido com ❤️ para hotéis**
