# 🗺️ Roadmap Técnico - Sistema de Gestão para Restaurante

## 📅 Timeline de Desenvolvimento

```
┌─────────────────────────────────────────────────────────────┐
│                   FASES DO DESENVOLVIMENTO                   │
└─────────────────────────────────────────────────────────────┘

FASE 1: Setup Inicial & Arquitetura Base          ✅ IN PROGRESS
└─ Semana 1-2

FASE 2: Backend Core - Autenticação & CRUD        📅 Próximo
└─ Semana 3-4

FASE 3: Sistema de Pedidos (Core Feature)         🔜 Fase 2+
└─ Semana 5-6

FASE 4: Frontend Admin Dashboard                  🔜 Fase 3+
└─ Semana 7-8

FASE 5: Frontend Cliente (Tablet)                 🔜 Fase 4+
└─ Semana 9-10

FASE 6: Integrações & Automações                  🔜 Fase 5+
└─ Semana 11-12

FASE 7: Testes, QA & Deploy                       🔜 Fase 6+
└─ Semana 13-14
```

## 📝 Fase 1: Setup Inicial ✅ IN PROGRESS

### ✅ Concluído

- [x] Estrutura de pastas (monorepo)
- [x] Docker Compose com PostgreSQL, Redis, n8n, pgAdmin
- [x] Prisma Schema com todas as entidades
- [x] NestJS base com módulos vazios
- [x] Documentação inicial (ARQUITETURA, ESTRUTURA, SETUP)
- [x] Configuração de ambiente (.env)
- [x] Health check endpoint

### 📅 Próximos (Fase 1 Final)

- [ ] Package.json do Frontend (Next.js)
- [ ] Package.json do Mobile
- [ ] Dockerfile para Frontend
- [ ] Nginx config base (produção)
- [ ] GitHub Actions workflow (CI/CD base)
- [ ] README completos de cada app
- [ ] Docker Compose de produção

**Estimativa**: ✅ Praticamente completa

---

## 🔐 Fase 2: Backend Core - Autenticação & CRUD

### Módulo: Auth (Autenticação & Autorização)

**Endpoints:**
```
POST   /auth/register          - Criar conta nova
POST   /auth/login             - Login (retorna JWT)
POST   /auth/refresh           - Renovar token
POST   /auth/logout            - Logout (invalidar token)
GET    /auth/me                - Dados do usuário logado
PATCH  /auth/change-password   - Mudar senha
POST   /auth/forgot-password   - Recuperar senha
```

**Implementação:**
- [x] Entity User (Prisma schema)
- [ ] AuthService (login, register, token generation)
- [ ] JWT Strategy (Passport)
- [ ] Auth Guard (proteção de rotas)
- [ ] Role-Based Guard (ADMIN, MANAGER, WAITER, etc)
- [ ] AuthController
- [ ] Testes unitários
- [ ] Testes E2E

**Entrega esperada**: DTOs validados, JWT seguro, password hashing

---

### Módulo: Users (Gestão de Usuários)

**Endpoints:**
```
GET    /users                  - Listar usuários (com filtro)
GET    /users/:id              - Detalhes do usuário
POST   /users                  - Criar usuário (Admin)
PATCH  /users/:id              - Atualizar usuário
DELETE /users/:id              - Deletar usuário (soft delete)
GET    /users/:id/audit-logs   - Logs de ação do usuário
```

**Implementação:**
- [x] Entity User (Prisma)
- [ ] UserService
- [ ] UserController
- [ ] DTO: CreateUserDto, UpdateUserDto
- [ ] Paginação & filtros
- [ ] Soft delete (isActive flag)
- [ ] Testes

**Entrega esperada**: CRUD completo com permissões role-based

---

### Módulo: Categories (Categorias do Menu)

**Endpoints:**
```
GET    /categories                 - Listar categorias
GET    /categories/:id             - Detalhes
POST   /categories                 - Criar (Admin)
PATCH  /categories/:id             - Atualizar (Admin)
DELETE /categories/:id             - Deletar (Admin)
PATCH  /categories/:id/reorder     - Reordenar exibição
```

**Implementação:**
- [x] Entity Category (Prisma)
- [ ] CategoryService
- [ ] CategoryController
- [ ] Validações (nome único, displayOrder)
- [ ] Soft delete
- [ ] Cache (Redis - TTL: 1 hora)
- [ ] Testes

**Entrega esperada**: CRUD com cache, validação de constraints

---

### Módulo: MenuItem (Itens do Cardápio)

**Endpoints:**
```
GET    /menu-items                          - Listar (com filtro/paginação)
GET    /menu-items/:id                      - Detalhes
GET    /menu-items/by-category/:categoryId  - Por categoria
POST   /menu-items                          - Criar (Admin)
PATCH  /menu-items/:id                      - Atualizar (Admin)
DELETE /menu-items/:id                      - Deletar (Admin)
POST   /menu-items/:id/upload-image         - Upload de imagem
```

**Implementação:**
- [x] Entity MenuItem (Prisma)
- [ ] MenuItemService
- [ ] MenuItemController
- [ ] Upload de imagens (local ou S3)
- [ ] Validações (preço, tempo de preparo)
- [ ] Search e filtros (vegetariano, sem glúten, etc)
- [ ] Cache (Redis)
- [ ] Testes

**Entrega esperada**: CRUD com upload, filtros avançados

---

### Módulo: Tables (Gestão de Mesas)

**Endpoints:**
```
GET    /tables                    - Listar mesas (com status)
GET    /tables/:id                - Detalhes
POST   /tables                    - Criar (Admin)
PATCH  /tables/:id                - Atualizar (Admin)
DELETE /tables/:id                - Deletar (Admin)
GET    /tables/available          - Mesas disponíveis
PATCH  /tables/:id/status         - Mudar status
```

**Implementação:**
- [x] Entity Table (Prisma)
- [ ] TableService
- [ ] TableController
- [ ] Status management (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
- [ ] Cache status em Redis
- [ ] Testes

**Entrega esperada**: CRUD com status e validações

---

**Timeline Fase 2**: 2 semanas
**Saída**: API pronta para criar pedidos (dependências satisfeitas)

---

## 📦 Fase 3: Sistema de Pedidos (CORE)

### Módulo: Orders

**Endpoints:**
```
POST   /orders                  - Criar pedido
GET    /orders                  - Listar pedidos (filtro por data, mesa, status)
GET    /orders/:id              - Detalhes completo do pedido
PATCH  /orders/:id              - Atualizar pedido (adicionar items, remover)
PATCH  /orders/:id/status       - Mudar status
DELETE /orders/:id              - Cancelar pedido
GET    /tables/:id/current-order - Pedido atual de uma mesa
```

**Features:**
- Criar pedido com múltiplos itens
- Validar disponibilidade de itens
- Calcular tempo total de preparo
- Sistema de status (PENDING → CONFIRMED → PREPARING → READY → DELIVERED → COMPLETED)
- Notas especiais por item (alergias, restrições)
- WebSocket: Notificar em tempo real sobre mudanças
- Histórico de status (quando passou por cada etapa)

**Implementação:**
- [x] Entity Order, OrderItem (Prisma)
- [ ] OrderService (criar, atualizar, validar)
- [ ] OrderController
- [ ] OrderItemService
- [ ] WebSocket Gateway (OrdersGateway)
- [ ] Validações complexas
- [ ] Cálculo de preço total
- [ ] Auditoria de mudanças
- [ ] Testes unitários + E2E

**Requisitos de negócio:**
- Não pode criar pedido em mesa MAINTENANCE ou OCCUPIED
- Só pode remover itens se status = PENDING
- Só pode modificar items se status ≤ CONFIRMED
- Tempo total = max(tempo de todos os itens)

---

### Módulo: Payments

**Endpoints:**
```
POST   /payments                 - Criar pagamento
GET    /payments/:id             - Detalhes
GET    /orders/:id/payments      - Histórico de pagamentos de um pedido
PATCH  /payments/:id/refund      - Reembolso
```

**Features:**
- Múltiplos métodos (CASH, CREDIT_CARD, DEBIT_CARD, PIX)
- Status tracking (PENDING → CONFIRMED → COMPLETED ou FAILED)
- Suporte a reembolsos parciais/totais
- Validação: só pode pagar se tem items READY

**Implementação:**
- [x] Entity Payment (Prisma)
- [ ] PaymentService
- [ ] PaymentController
- [ ] Integração com gateway (stub para agora)
- [ ] Validações de negócio
- [ ] Webhook trigger para n8n
- [ ] Testes

---

### Módulo: AuditLogs

**Features:**
- Log automático de toda ação no sistema
- Registrar: usuário, ação, entidade, dados antigos/novos
- Queries para auditoria
- Não permitir deleção (append-only)

**Implementação:**
- [x] Entity AuditLog (Prisma)
- [ ] AuditService (logging centralizado)
- [ ] Interceptor global (auto-log de requests)
- [ ] AuditController (queries)
- [ ] Testes

---

**Timeline Fase 3**: 2 semanas
**Saída**: Sistema de pedidos em tempo real funcionando com WebSockets

---

## 🎨 Fase 4: Frontend Admin Dashboard

### Tecnologias
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query (data fetching)
- React Hook Form + Zod (validação)
- Zustand (global state)

### Páginas/Features

**1. Autenticação**
- Login page
- Forgot password
- Profile edit
- Logout

**2. Dashboard**
- KPIs: vendas do dia, pedidos em preparo, itens mais vendidos
- Gráficos: vendas por hora, itens populares
- Pedidos em tempo real (refresh via WebSocket)
- Alertas de sistema

**3. Gestão de Cardápio**
- Listar categorias + CRUD
- Listar itens + CRUD com upload de imagem
- Filtros e busca
- Ativar/desativar items

**4. Gestão de Mesas**
- Visualizar mesas (grid)
- Indicador de status (cores)
- CRUD de mesas
- Atribuição de áreas

**5. Gestão de Usuários**
- Listar usuários + filtros
- CRUD completo
- Atribuição de roles
- Ativar/desativar

**6. Relatórios**
- Vendas por período
- Top itens
- Performance por mesa
- Consumo por categoria
- Export CSV/PDF

**7. Configurações**
- Sistema: nome, logo, horários
- Taxas e descontos
- Webhooks n8n
- Backup manual
- Logs do sistema

**Estimativa**: 2-3 semanas

---

## 📱 Fase 5: Frontend Cliente (Tablet)

### Funcionalidades

**1. Tela de Cardápio**
- Scroll vertical por categorias
- Grid de itens com imagem
- Filtros: vegetariano, sem glúten, busca
- Detalhe do item: imagem, descrição, preço, tempo
- Botão de adicionar ao carrinho

**2. Carrinho**
- Listagem de itens selecionados
- Quantidade ajustável
- Remover itens
- Notas especiais (alergias, preferências)
- Subtotal, descontos, taxa de serviço
- Botão finalizar

**3. Confirmação & Acompanhamento**
- Resumo do pedido
- Status em tempo real
- Mapa visual: recebido → preparando → pronto
- Tempo estimado
- Botão "chamar garçom"
- Solicitação de conta

**4. Menu Lateral**
- Seleção de mesa (se não for fixa)
- Histórico de pedidos
- Configurações (som, idioma)
- Help/FAQ

**Estimativa**: 2-3 semanas

---

## 🚀 Fase 6: Integrações & Automações (n8n)

### Webhooks da API

**Eventos disparados:**
- `order.created` - Novo pedido
- `order.status.updated` - Status mudou
- `order.completed` - Pedido concluído
- `payment.completed` - Pagamento confirmado
- `category.created` - Nova categoria
- `menu_item.created` - Novo item
- `user.created` - Novo usuário

### Workflows n8n (exemplos)

**1. Notificação de Novo Pedido**
```
Webhook (order.created) 
  → Format message 
  → Send via Telegram/Email/SMS 
  → Log
```

**2. Relatório Diário Automático**
```
Schedule (06:00 AM) 
  → Query vendas do dia anterior 
  → Gerar relatório 
  → Send Email para gerente
```

**3. Alertas de Estoque Baixo**
```
Schedule (2x dia) 
  → Check items com preparedItems < 5
  → Send alert via Telegram
```

**4. Backup Automático**
```
Schedule (00:00) 
  → Export database 
  → Upload S3 
  → Cleanup backups antigos
```

**Estimativa**: 1 semana

---

## 🧪 Fase 7: Testes, QA & Deploy

### Testes

**Backend:**
- Unit tests: Services, Guards, Pipes (>80% coverage)
- Integration tests: Controllers + Database
- E2E tests: Fluxos completos (auth → order → payment)

**Frontend:**
- Component tests: Cada componente
- Integration tests: Páginas completas
- E2E tests: Journeys principais (login → cardápio → pedido)

### QA

- Teste manual em ambiente de staging
- Teste de carga com k6 ou Apache JMeter
- Teste de segurança (OWASP Top 10)
- Cross-browser testing

### Deploy

**Local Development:**
```bash
docker-compose up -d
npm run dev
```

**Staging:**
```bash
git push origin staging
GitHub Actions:
  - Build Docker images
  - Push para registry
  - Deploy via docker-compose
  - Run smoke tests
```

**Produção:**
```bash
git tag v1.0.0
git push origin v1.0.0
GitHub Actions:
  - Build & test
  - Build Docker images
  - Push para registry
  - Deploy com blue-green strategy
  - Run health checks
  - Rollback automático se falhar
```

**Estimativa**: 1-2 semanas

---

## 📊 Resumo Timeline

| Fase | Descrição | Semanas | Status |
|------|-----------|---------|--------|
| 1 | Setup & Arquitetura | 2 | ✅ IN PROGRESS |
| 2 | Backend Core | 2 | 📅 Next |
| 3 | Sistema de Pedidos | 2 | 🔜 Após Fase 2 |
| 4 | Admin Dashboard | 3 | 🔜 Após Fase 3 |
| 5 | Cliente Tablet | 3 | 🔜 Após Fase 4 |
| 6 | Integrações | 1 | 🔜 Após Fase 5 |
| 7 | Testes & Deploy | 2 | 🔜 Final |
| **Total** | | **15 semanas** | |

---

## 🎯 Definição de Pronto

### Sprint Planning

Para cada sprint (2 semanas):
1. Selecionar features
2. Quebrar em tasks
3. Estimar esforço (1-5 pontos)
4. Atribuir devs
5. Daily standup
6. Sprint review
7. Retrospectiva

### Critérios de Aceitação (AC)

Cada feature deve ter:
```
AC1: Endpoint retorna status 200 com dados corretos
AC2: Validações funcionam (input inválido retorna 400)
AC3: Autenticação é obrigatória se aplicável
AC4: Testes unitários com >80% coverage
AC5: Documentação Swagger atualizada
AC6: Sem console.logs em produção
AC7: Performance aceitável (< 200ms)
```

---

## 🚀 Próximos Passos (Imediato)

1. ✅ Fase 1 praticamente completa
2. ⏳ Começar Fase 2 - Implementar AuthService e AuthController
3. 📝 Detalhar testes para Auth
4. 🎨 Começar esboço do Frontend

---

**Last Updated**: 13 de Janeiro de 2024
**Project Manager**: Gabriel
