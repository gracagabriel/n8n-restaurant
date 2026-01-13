# 📋 Estrutura de Pastas do Projeto

## Tree Completa

```
n8n-restaurant/
│
├── 📁 apps/                              # Aplicações do monorepo
│   ├── 📁 backend/                       # API NestJS
│   │   ├── src/
│   │   │   ├── modules/                  # Features (separado por domínio)
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── categories/
│   │   │   │   ├── menu-items/
│   │   │   │   ├── tables/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── reports/
│   │   │   │   ├── webhooks/
│   │   │   │   └── audit-logs/
│   │   │   ├── common/                   # Código compartilhado
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   ├── filters/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   └── entities/
│   │   │   ├── config/                   # Configurações
│   │   │   ├── database/                 # Camada de dados (Prisma)
│   │   │   ├── app.module.ts             # Módulo raiz
│   │   │   └── main.ts                   # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Definição do banco
│   │   │   ├── migrations/               # Migrações (criadas automático)
│   │   │   └── seed.ts                   # Dados iniciais
│   │   ├── test/
│   │   │   ├── e2e/
│   │   │   └── jest-e2e.json
│   │   ├── .eslintrc.json
│   │   ├── .prettierrc
│   │   ├── jest.config.js
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── 📁 frontend/                      # Admin Dashboard (Next.js)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                      # App Router (Next.js 13+)
│   │   │   ├── components/               # React Components
│   │   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── lib/                      # Utilities, API client
│   │   │   ├── store/                    # Zustand/Jotai state
│   │   │   ├── styles/                   # Tailwind configs
│   │   │   └── types/                    # TypeScript types
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── 📁 mobile/                        # Cliente (Tablet)
│       ├── [Similar ao frontend]
│
├── 📁 infra/                             # Infraestrutura
│   ├── 📁 docker/
│   │   ├── docker-compose.yml            # Orquestração local
│   │   ├── Dockerfile.backend            # Build backend
│   │   ├── Dockerfile.frontend           # Build frontend
│   │   ├── init.sql                      # Inicialização do banco
│   │   └── .dockerignore
│   │
│   ├── 📁 nginx/
│   │   ├── nginx.conf                    # Config principal
│   │   ├── default.conf                  # Site default
│   │   └── ssl/                          # Certificados (em prod)
│   │
│   └── 📁 scripts/
│       ├── deploy.sh                     # Deploy script
│       ├── migrate.sh                    # Database migration
│       ├── backup.sh                     # Backup database
│       └── health-check.sh               # Health check
│
├── 📁 services/
│   └── 📁 n8n-workflows/
│       ├── notifications.json            # Workflow: notificações
│       ├── daily-reports.json            # Workflow: relatórios diários
│       ├── inventory-alerts.json         # Workflow: alertas estoque
│       └── backup-automation.json        # Workflow: backup automático
│
├── 📁 docs/
│   ├── SETUP.md                          # Guia de instalação
│   ├── ARQUITETURA.md                    # Arquitetura do projeto
│   ├── PADROES.md                        # Padrões de código
│   ├── DEPLOY.md                         # Guia de deploy
│   ├── API.md                            # Documentação API (auto-gen)
│   └── ESTRUTURA.md                      # Este arquivo
│
├── 📁 test/                              # Testes globais (se houver)
│
├── .gitignore
├── .env.example
├── .github/                              # GitHub Actions, etc
│   └── workflows/                        # CI/CD
├── docker-compose.yml                    # Compose principal
├── package.json                          # Root package
├── tsconfig.json                         # TS config global
├── README.md                             # README principal
└── LICENSE
```

## Descrição por Pasta

### `apps/backend`
Aplicação NestJS com lógica de negócio principal.
- **modules/**: Cada módulo é uma feature independente
- **common/**: Code compartilhado (guards, pipes, decoradores)
- **database/**: Abstração Prisma
- **config/**: Validação de variáveis de ambiente
- **test/**: Testes E2E

### `apps/frontend`
Dashboard administrativo com Next.js 14.
- **app/**: App Router (novo Next.js)
- **components/**: Componentes React reutilizáveis
- **lib/**: API client, utilities
- **store/**: Estado global com Zustand/React Query

### `apps/mobile`
Interface para tablet do cliente (cardápio, pedidos).
- Mesma estrutura do frontend
- Responsivo para tablets
- PWA-ready para offline support

### `infra/docker`
Configurações Docker para desenvolvimento e produção.
- `docker-compose.yml`: Orquestra PostgreSQL, Redis, n8n, pgAdmin
- Volumes persistentes para dados
- Health checks para cada serviço

### `infra/nginx`
Proxy reverso Nginx (produção).
- Load balancing
- SSL/TLS
- Compressão Gzip
- Cache de assets

### `infra/scripts`
Scripts de DevOps e automação.
- Deploy progressivo
- Migrações de banco
- Backups
- Health checks

### `services/n8n-workflows`
Automações via n8n.
- Webhooks dos eventos da API
- Orquestração de notificações
- Relatórios automáticos
- Backups agendados

### `docs/`
Documentação completa do projeto.
- Arquitetura e decisões técnicas
- Padrões de código
- Guias de setup e deploy
- API (gerada com Swagger)

## Convenções de Arquivo

### Backend (NestJS)

```
module-name/
├── module-name.module.ts          # Módulo (imports/exports)
├── module-name.service.ts         # Lógica negocial
├── module-name.controller.ts      # Endpoints HTTP
├── module-name.service.spec.ts    # Testes (paralelo)
├── dto/
│   ├── create-xxx.dto.ts          # Input DTO
│   └── xxx.response.dto.ts        # Output DTO
├── entities/
│   └── xxx.entity.ts              # Entidade (mapear Prisma)
├── guards/
│   └── xxx.guard.ts               # Guards de proteção
└── interfaces/
    └── xxx.interface.ts           # Interfaces/contracts
```

### Frontend (Next.js)

```
(feature)/
├── page.tsx                        # Página da feature
├── layout.tsx                      # Layout se houver
├── components/
│   └── feature-component.tsx       # Componentes da feature
├── hooks/
│   └── use-feature.ts              # Hooks customizados
├── lib/
│   └── feature-api.ts              # API client da feature
└── [id]/
    └── page.tsx                    # Rota dinâmica
```

## Volumes Docker (Persistência)

```
postgres_data/          # Banco de dados PostgreSQL
redis_data/             # Cache e sessions Redis
pgadmin_data/           # Dados do pgAdmin
n8n_data/               # Workflows e execuções n8n
```

## Variáveis de Ambiente

### `.env.example`
Template de configuração. Cada desenvolvedor cria `.env` local.

### Seções
1. **DATABASE**: PostgreSQL connection
2. **JWT**: Secrets de autenticação
3. **API**: Configurações da aplicação
4. **FRONTEND**: URLs públicas
5. **N8N**: Webhooks e automações
6. **REDIS**: Cache e sessions
7. **MAIL**: SMTP (opcional)
8. **AWS S3**: Upload de imagens (opcional)
9. **CORS**: Domínios permitidos

## CI/CD (GitHub Actions)

Espaço reservado para workflows automáticos:
- Test em cada push
- Build automático
- Deploy em staging/produção

---

**Dica**: Use tree command para visualizar:
```bash
tree -I 'node_modules|dist|.next|.prisma' -L 3
```
