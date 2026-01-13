# 🚀 Guia Prático - Setup Passo a Passo

## ⏱️ Tempo Total: ~45 minutos

Este guia é **100% prático**. Execute cada passo e verifique antes de ir ao próximo.

---

## 🟢 PASSO 1: Verificar Pré-requisitos (5 minutos)

### 1.1 Verificar Node.js

```bash
node --version
```

**Esperado**: `v18.x.x` ou superior

❌ Se não tiver:
```bash
# Windows: Download em https://nodejs.org/
# ou use choco (se tiver chocolatey)
choco install nodejs
```

### 1.2 Verificar npm

```bash
npm --version
```

**Esperado**: `9.x.x` ou superior

### 1.3 Verificar Docker

```bash
docker --version
docker-compose --version
```

**Esperado**: 
- Docker version 20.x ou superior
- Docker Compose version 2.x ou superior

❌ Se não tiver:
- Download Docker Desktop: https://www.docker.com/products/docker-desktop

### 1.4 Verificar Git

```bash
git --version
```

**Esperado**: `git version 2.x.x` ou superior

✅ Se tudo passou: **Continue para o PASSO 2**

---

## 🟢 PASSO 2: Copiar Arquivo de Configuração (2 minutos)

### 2.1 Abrir terminal na pasta do projeto

```bash
cd n8n-restaurant
```

### 2.2 Criar .env

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2.3 Verificar se foi criado

```bash
# Windows
dir .env

# Linux/Mac
ls -la .env
```

**Esperado**: Arquivo `.env` deve aparecer

✅ **PASSO 2 Completo**

---

## 🟢 PASSO 3: Iniciar Docker Compose (15 minutos)

### 3.1 Iniciar os serviços

```bash
docker-compose up -d
```

**Esperado**:
```
✓ Container restaurant_postgres is healthy
✓ Container restaurant_redis is healthy
✓ Container restaurant_pgadmin is healthy
✓ Container restaurant_n8n is healthy
✓ Container restaurant_mailhog is healthy
```

### 3.2 Verificar status

```bash
docker-compose ps
```

**Esperado**: Algo como:

```
NAME                    STATUS
restaurant_postgres     Up (healthy)
restaurant_redis        Up (healthy)
restaurant_pgadmin      Up (healthy)
restaurant_n8n          Up (healthy)
restaurant_mailhog      Up (healthy)
```

❌ Se algum não estiver "healthy":

```bash
# Ver logs do serviço com problema
docker-compose logs postgres
docker-compose logs redis

# Aguardar um pouco mais (até 60 segundos)
sleep 30
docker-compose ps

# Se continuar com problema, reiniciar
docker-compose down -v
docker-compose up -d
```

### 3.3 Aguardar tudo ficar pronto (IMPORTANTE!)

```bash
# Aguarde 30-60 segundos
# Postgres leva tempo para inicializar
```

✅ **PASSO 3 Completo** - Quando todos os containers estão "healthy"

---

## 🟢 PASSO 4: Setup do Backend (20 minutos)

### 4.1 Entrar na pasta backend

```bash
cd apps/backend
```

### 4.2 Instalar dependências

```bash
npm install
```

**Esperado**: Muitos pacotes sendo instalados (~2-3 minutos)

```
added 800 packages in 2m 30s
```

### 4.3 Gerar tipos Prisma

```bash
npx prisma generate
```

**Esperado**:
```
✔ Generated Prisma Client (v5.x.x) in xxx ms
```

### 4.4 Rodar migrações do banco

```bash
npx prisma migrate dev --name init
```

**Esperado**: Pergunta "Do you want to push the Prisma state to the database? (y/n)"

Responda: **`y`** (sim)

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "restaurant_db"

✔ Your database is now in sync with your Prisma schema. 
✔ Generated Prisma Client (v5.x.x) in xxx ms

Migration created in 'prisma/migrations/..._init'
```

### 4.5 Popular banco com dados de teste

```bash
npx prisma db seed
```

**Esperado**:
```
🌱 Iniciando seed do banco de dados...
✓ Usuários criados
✓ Categorias criadas
✓ Itens do menu criados
✓ Mesas criadas
✓ Pedido de exemplo criado
✓ Configurações do sistema criadas
✅ Seed concluído com sucesso!
```

### 4.6 Verificar com Prisma Studio (opcional)

```bash
npx prisma studio
```

Vai abrir no navegador mostrando todas as tabelas com dados ✨

(Aperte Ctrl+C para sair)

✅ **PASSO 4 Completo** - Banco de dados pronto!

---

## 🟢 PASSO 5: Iniciar Backend (5 minutos)

### 5.1 Iniciar o servidor

```bash
npm run start:dev
```

**Esperado**: Será mostrado:

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

✅ **PASSO 5 Completo** - Backend rodando!

---

## 🟢 PASSO 6: Testar Endpoints (5 minutos)

**Deixe o backend rodando e abra UM NOVO TERMINAL**

### 6.1 Health Check (mais importante!)

```bash
curl http://localhost:3000/health
```

**Esperado**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-13T10:30:00.000Z",
  "database": "connected"
}
```

✅ Se tiver status "ok" e database "connected" = **TUDO FUNCIONANDO!**

### 6.2 Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.local","password":"admin123"}'
```

**Esperado**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@restaurant.local",
    "name": "Administrador",
    "role": "ADMIN"
  }
}
```

❌ Se receber erro "Cannot POST /api/auth/login":
- Auth ainda não foi implementado (esperado - é Fase 2)
- Mas health check deve funcionar

### 6.3 Acessar Swagger (visual)

Abra no navegador: **http://localhost:3000/api/docs**

Deve aparecer uma página azul com documentação interativa

✅ **PASSO 6 Completo**

---

## 🟢 PASSO 7: Acessar Ferramentas Administrativas (5 minutos)

### 7.1 pgAdmin (Gerenciar Banco)

1. Abra: http://localhost:5050
2. Login com:
   - Email: `admin@restaurant.local`
   - Senha: `admin`
3. Conectar servidor PostgreSQL:
   - Host: `postgres`
   - Porta: `5432`
   - User: `restaurant_user`
   - Password: `restaurant_password`
   - Database: `restaurant_db`

✅ Deve aparecer as tabelas que criamos!

### 7.2 n8n (Automações)

1. Abra: http://localhost:5678
2. Setup inicial (criar conta admin)
3. Pode deixar para depois (usaremos em Fase 6)

### 7.3 Mailhog (Teste de Emails)

1. Abra: http://localhost:8025
2. Não tem login - já está pronto

✅ **PASSO 7 Completo**

---

## ✅ VERIFICAÇÃO FINAL - Tudo Funcionando?

Marque todos os itens:

```
DOCKER
  [ ] Todos os 5 containers estão "healthy"
  [ ] docker-compose ps mostra tudo verde

BACKEND
  [ ] npm install completou
  [ ] npx prisma generate completou
  [ ] npx prisma migrate dev completou
  [ ] npx prisma db seed completou
  [ ] npm run start:dev está rodando

TESTES
  [ ] curl http://localhost:3000/health retorna status "ok"
  [ ] Swagger acessível em http://localhost:3000/api/docs
  [ ] pgAdmin acessível em http://localhost:5050
  [ ] n8n acessível em http://localhost:5678

BANCO
  [ ] Verificar no pgAdmin que existem tabelas
  [ ] Ver 5 usuários de teste no pgAdmin
  [ ] Ver cardápio com 5 categorias e 11 itens
  [ ] Ver 5 mesas

PRONTO
  [ ] SIM! Tudo funcionando!
```

---

## 🎯 O Que Você Tem Agora?

✅ **Backend completo**
- API rodando em http://localhost:3000
- Documentação em http://localhost:3000/api/docs
- Health check funcionando

✅ **Banco de dados**
- 10 tabelas criadas
- Dados de teste inseridos
- Acessível via pgAdmin

✅ **Infraestrutura**
- PostgreSQL rodando
- Redis para cache
- n8n para automações
- Mailhog para testes de email

✅ **Documentação**
- 11 documentos completos
- Arquitetura definida
- Padrões de código documentados
- Roadmap com 7 fases

---

## 🚨 Troubleshooting Rápido

### Problema: "Cannot connect to Docker daemon"

```bash
# Windows: Abra Docker Desktop
# Linux: sudo systemctl start docker
# Mac: Abra Docker.app
```

### Problema: "Port 5432 already in use"

```bash
# Encontrar o processo usando a porta
netstat -ano | findstr :5432

# Matar o processo (Windows)
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5432
kill -9 <PID>
```

### Problema: "Database connection refused"

```bash
# Esperar postgres ficar pronto
docker-compose logs postgres

# Restartar
docker-compose restart postgres

# Aguardar 30 segundos
sleep 30

# Tentar novamente
npm run start:dev
```

### Problema: "Prisma schema validation failed"

```bash
# Validar schema
npx prisma validate

# Se tiver erro, ver qual é
cat prisma/schema.prisma
```

### Problema: Seed falha

```bash
# Limpar tudo e recomeçar
npx prisma migrate reset

# Responda 'y' quando perguntar
# Responda 'y' para rodar seed automaticamente
```

---

## 📊 Resumo de Passos

| # | Passo | Tempo | Comando |
|---|-------|-------|---------|
| 1 | Verificar pré-requisitos | 5 min | `node -v`, `docker -v` |
| 2 | Copiar .env | 2 min | `cp .env.example .env` |
| 3 | Docker Compose | 15 min | `docker-compose up -d` |
| 4 | Setup Backend | 20 min | `npm install` + Prisma |
| 5 | Rodar Backend | 5 min | `npm run start:dev` |
| 6 | Testar | 5 min | `curl localhost:3000/health` |
| 7 | Ferramentas Admin | 5 min | Abrir navegador |
| **Total** | | **~45 min** | |

---

## 🎉 Próximo Passo

Quando tudo estiver funcionando:

1. Leia **docs/ARQUITETURA.md** (entender design)
2. Leia **docs/PADROES.md** (padrões de código)
3. Comece **Fase 2: Implementar Auth**

---

## 📝 Anotações

Use este espaço para anotar:

```
Data que comecei: _______________
Container que travou: _______________
Erro encontrado: _______________
Tempo total que levou: _______________
```

---

**Desenvolvido com ❤️ para seu sucesso**

*Última atualização: 13 de Janeiro de 2024*
