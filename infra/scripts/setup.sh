#!/bin/bash

# ==========================================
# Deploy Script - Local Development
# ==========================================

set -e

echo "🚀 Iniciando setup do projeto..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Docker Compose
echo -e "${BLUE}📦 Iniciando serviços Docker...${NC}"
docker-compose up -d

# Aguardar banco ficar pronto
echo "⏳ Aguardando PostgreSQL..."
sleep 15

# 2. Backend Setup
echo -e "${BLUE}🔧 Configurando Backend...${NC}"
cd apps/backend

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

echo -e "${GREEN}✅ Backend pronto!${NC}"
cd ../..

# 3. Frontend Setup (opcional)
if [ "$1" != "--backend-only" ]; then
  echo -e "${BLUE}⚛️  Configurando Frontend...${NC}"
  cd apps/frontend
  npm install
  echo -e "${GREEN}✅ Frontend pronto!${NC}"
  cd ../..
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup completo com sucesso!          ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  📍 Backend:  http://localhost:3000      ║${NC}"
echo -e "${GREEN}║  📚 Swagger:  http://localhost:3000/api/docs║${NC}"
if [ "$1" != "--backend-only" ]; then
  echo -e "${GREEN}║  ⚛️  Frontend: http://localhost:3001      ║${NC}"
fi
echo -e "${GREEN}║  🐘 pgAdmin:  http://localhost:5050      ║${NC}"
echo -e "${GREEN}║  🤖 n8n:      http://localhost:5678      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "📝 Próximos passos:"
echo "  1. cd apps/backend && npm run start:dev"
echo "  2. cd apps/frontend && npm run dev"
echo ""
