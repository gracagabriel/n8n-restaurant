# 🚀 Guia de Setup Inicial

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js**: v18.x ou superior
- **npm**: v9.x ou superior (incluso com Node.js)
- **Docker**: v20.x
- **Docker Compose**: v2.x
- **Git**: Para versionamento

### Verificar Instalação

```bash
node --version    # v18.x.x
npm --version     # 9.x.x
docker --version  # Docker version 20.x
docker-compose --version  # Docker Compose version 2.x
```

## 1. Clonar o Repositório

```bash
cd ~/Projetos
git clone <repository-url> n8n-restaurant
cd n8n-restaurant
```

## 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e crie sua configuração local:

```bash
# Copiar template
cp .env.example .env
```

Edite `.env` com suas configurações. Para desenvolvimento local, os valores padrão funcionam:

```env
# DATABASE (deixar padrão para dev)
DATABASE_URL=postgresql://restaurant_user:restaurant_password@postgres:5432/restaurant_db

# JWT (MUDAR EM PRODUÇÃO!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# API
API_PORT=3000
API_HOST=0.0.0.0

# FRONTEND
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

## 3. Iniciar Serviços Docker

O Docker Compose levanta PostgreSQL, Redis, pgAdmin e n8n:

```bash
# Iniciar em background
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Parar e remover volumes (limpar tudo)
docker-compose down -v
```

### Aguarde os Serviços Ficarem Healthy

Pode levar 30-60 segundos para tudo estar pronto. Verifique:

```bash
# Verificar saúde dos containers
docker-compose ps

# Devem estar "healthy" ou "running"
```

### Acessar Ferramentas

- **pgAdmin**: http://localhost:5050/pgadmin
  - Email: admin@restaurant.local
  - Senha: admin

- **n8n**: http://localhost:5678
  - Primeiro acesso: criar conta admin

- **Mailhog**: http://localhost:8025 (testes de email)

## 4. Setup Backend (NestJS)

### 4.1 Instalar Dependências

```bash
cd apps/backend
npm install
```

### 4.2 Gerar Cliente Prisma

```bash
# Gera tipos TypeScript do schema
npx prisma generate
```

### 4.3 Rodar Migrações do Banco

```bash
# Criar tabelas no banco
npx prisma migrate dev --name init

# Responda "yes" quando perguntado se quer executar seed
```

### 4.4 Seed do Banco (Dados Iniciais)

```bash
# Inserir dados de exemplo (usuários, cardápio, mesas)
npx prisma db seed
```

Você terá no banco:

| Usuário | Email | Senha | Papel |
|---------|-------|-------|-------|
| Admin | admin@restaurant.local | admin123 | ADMIN |
| Gerente | gerente@restaurant.local | admin123 | MANAGER |
| Garçom | garcom@restaurant.local | admin123 | WAITER |
| Cozinha | cozinha@restaurant.local | admin123 | KITCHEN |
| Bar | bar@restaurant.local | admin123 | BAR |

> ⚠️ Mudar senhas em produção!

### 4.5 Iniciar Backend

```bash
# Terminal 1: Dev com hot reload
npm run start:dev

# Ou produção
npm run build
npm run start:prod
```

Quando iniciar, você verá:

```
╔════════════════════════════════════════════════════════════╗
║  🚀 Restaurant Management API iniciada com sucesso!       ║
╠════════════════════════════════════════════════════════════╣
║  📍 Endpoint:   http://localhost:3000                     ║
║  📚 Swagger:    http://localhost:3000/api/docs           ║
║  🔐 JWT Auth:   Ativada                                    ║
║  🗄️  Banco:      PostgreSQL                                ║
║  ⚡ Redis:      Ativado para cache e WebSockets           ║
╚════════════════════════════════════════════════════════════╝
```

Acesse: http://localhost:3000/api/docs

### 4.6 Testando API

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.local","password":"admin123"}'
```

## 5. Setup Frontend (Next.js)

### 5.1 Instalar Dependências

```bash
cd apps/frontend
npm install
```

### 5.2 Iniciar em Desenvolvimento

```bash
# Terminal separado
npm run dev

# Acessa em http://localhost:3001
```

## 6. Verificar Tudo Está Funcionando

### Checklist Final

- [ ] Docker Compose running (`docker-compose ps`)
- [ ] PostgreSQL healthy
- [ ] Redis healthy
- [ ] Backend iniciado na porta 3000
- [ ] Frontend iniciado na porta 3001
- [ ] Swagger acessível: http://localhost:3000/api/docs
- [ ] pgAdmin acessível: http://localhost:5050
- [ ] n8n acessível: http://localhost:5678

### Testes Rápidos

```bash
# Backend - Health check
curl http://localhost:3000/health

# Backend - Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.local","password":"admin123"}'

# Frontend - Deveria retornar página HTML
curl http://localhost:3001
```

## 7. Comandos Úteis

### Desenvolvimento

```bash
# Backend
cd apps/backend

npm run start:dev          # Dev com hot reload
npm run test              # Testes unitários
npm run test:cov          # Cobertura de testes
npm run lint              # ESLint
npm run format            # Prettier

# Prisma
npx prisma studio        # UI visual para banco (abra browser)
npx prisma migrate dev   # Executar novas migrações
npx prisma db seed       # Re-seed dados
```

```bash
# Frontend
cd apps/frontend

npm run dev               # Dev server
npm run build             # Build produção
npm run start             # Rodar build
npm run lint              # ESLint
```

### Docker

```bash
# Root do projeto
docker-compose up -d              # Iniciar tudo em background
docker-compose down               # Parar tudo
docker-compose logs -f [service]  # Ver logs de um serviço
docker-compose ps                 # Status dos serviços

# Limpar volumes (dados persistentes)
docker-compose down -v
```

### Root (Monorepo)

```bash
npm run install:all       # Instalar deps de tudo
npm run dev              # Iniciar backend + frontend
npm run build            # Build de tudo
npm run test             # Testes de tudo
```

## 8. Troubleshooting

### Erro: "Cannot find module '@nestjs/common'"

```bash
cd apps/backend
npm install
npx prisma generate
```

### Erro: "Database connection refused"

```bash
# Verificar se postgres está rodando
docker-compose ps

# Reiniciar postgres
docker-compose restart postgres

# Aguardar 10 segundos e tentar novamente
```

### Erro: "Port 3000 already in use"

```bash
# Opção 1: Matar processo
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Opção 2: Usar outra porta
API_PORT=3001 npm run start:dev
```

### Erro: "ENOENT: no such file or directory, stat 'prisma/dev.db'"

```bash
# Apenas se estivesse usando SQLite (não é nosso caso)
# Ignore este erro
```

### Banco de dados vazio após migrações

```bash
# Re-executar seed
cd apps/backend
npx prisma db seed
```

## 9. Próximos Passos

Após setup bem-sucedido:

1. **Explorar Swagger**: http://localhost:3000/api/docs
2. **Fazer primeiro login**: Use credenciais acima
3. **Testar endpoints**: Criar categoria, item de menu, pedido
4. **Revisar código**: Estrutura em `apps/backend/src`
5. **Ler arquitetura**: `docs/ARQUITETURA.md`
6. **Padrões de código**: `docs/PADROES.md`

## 10. Desenvolvimento Local

### Watch Mode (Recompila ao salvar)

```bash
# Backend
cd apps/backend
npm run start:dev

# Frontend
cd apps/frontend
npm run dev
```

### Logs em Tempo Real

```bash
# Todos os serviços Docker
docker-compose logs -f

# Um serviço específico
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f n8n
```

### Resetar Banco (Cuidado!)

```bash
cd apps/backend

# Limpar e re-criar
npx prisma migrate reset

# Ou manual
npx prisma db push --force-reset  # ⚠️ PERDE DADOS
npx prisma db seed
```

---

## Suporte

Encontrou problema? Verifique:

1. Todos os containers estão running: `docker-compose ps`
2. Backend responde: `curl http://localhost:3000/health`
3. Banco está acessível via pgAdmin
4. Variáveis de ambiente em `.env` estão corretas

---

**Desenvolvido com ❤️ para hotelaria**
