# 🍽️ Sistema de Gestão para Bar e Restaurante de Hotel

Sistema completo de gestão desenvolvido com as melhores práticas, incluindo gestão de pedidos em tempo real, cardápio digital, dashboard administrativo e integrações com n8n.

## 📚 Documentação Completa

- [ROADMAP.md](./docs/ROADMAP.md) - Roteiro técnico detalhado
- [ARQUITETURA.md](./docs/ARQUITETURA.md) - Decisões arquiteturais
- [API.md](./docs/API.md) - Documentação da API (gerada automaticamente)
- [SETUP.md](./docs/SETUP.md) - Guia de instalação

## 🏗️ Estrutura do Projeto

```
n8n-restaurant/
├── apps/
│   ├── backend/              # NestJS API
│   ├── frontend/             # Next.js Admin Dashboard
│   └── mobile/               # Frontend Cliente (Tablet)
├── infra/
│   ├── docker/               # Dockerfiles
│   ├── nginx/                # Configurações Nginx
│   └── scripts/              # Scripts de deploy
├── services/
│   └── n8n-workflows/        # Workflows de automação
└── docs/                     # Documentação
```

## 🚀 Quick Start

### Pré-requisitos
- Docker & Docker Compose
- Node.js 18+
- npm ou yarn

### Instalação Local

1. **Clone o repositório**
```bash
cd n8n-restaurant
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

3. **Inicie os serviços com Docker Compose**
```bash
docker-compose up -d
```

4. **Instale as dependências do backend**
```bash
cd apps/backend
npm install
```

5. **Configure o banco de dados**
```bash
cd apps/backend
npx prisma migrate dev --name init
npx prisma db seed
```

6. **Instale as dependências do frontend**
```bash
cd apps/frontend
npm install
npm run dev
```

## 📋 Stack Tecnológico

### Backend
- **Node.js 18+** com TypeScript
- **NestJS** - Framework progressivo
- **PostgreSQL** - Banco de dados
- **Prisma ORM** - Acesso a dados
- **Jest** - Testes unitários
- **WebSockets** - Atualizações em tempo real

### Frontend
- **React 18** com TypeScript
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **React Hook Form** + **Zod** - Formulários
- **TanStack Query** - Estado assíncrono

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Nginx** - Proxy reverso
- **n8n** - Automações

## 📊 Funcionalidades Principais

### Cliente (Tablet)
- ✅ Cardápio digital interativo
- ✅ Carrinho de pedidos
- ✅ Rastreamento em tempo real
- ✅ Solicitação de conta

### Operacional (Cozinha/Bar)
- ✅ Painel de pedidos
- ✅ Notificações visuais/sonoras
- ✅ Tempo de preparo

### Admin
- ✅ Dashboard com métricas
- ✅ Gestão de cardápio
- ✅ Gestão de usuários
- ✅ Relatórios

## 🧪 Testes

### Backend
```bash
cd apps/backend
npm run test              # Testes unitários
npm run test:e2e          # Testes E2E
npm run test:cov          # Cobertura
```

### Frontend
```bash
cd apps/frontend
npm run test              # Testes
npm run test:cov          # Cobertura
```

## 📝 Scripts Disponíveis

### Root
```bash
npm run install:all       # Instala dependências de todos os apps
npm run dev              # Inicia todos os apps em modo dev
npm run build            # Build de produção
npm run test             # Executa todos os testes
npm run docker:up        # Inicia Docker Compose
npm run docker:down      # Para Docker Compose
```

## 🔒 Segurança

- JWT para autenticação
- Bcrypt para hash de senhas
- Validação com class-validator
- CORS configurado
- Helmet para proteção de headers
- Rate limiting

## 📚 Guias Importantes

- [Setup Local](./docs/SETUP.md)
- [Estrutura de Pastas](./docs/ESTRUTURA.md)
- [Padrões de Código](./docs/PADROES.md)
- [Fluxo de Deploy](./docs/DEPLOY.md)

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit suas mudanças: `git commit -am 'Add feature'`
3. Push para a branch: `git push origin feature/sua-feature`
4. Abra um Pull Request

## 📄 Licença

MIT

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para hotéis e restaurantes**
