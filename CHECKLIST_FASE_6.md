# ✅ Checklist - Fase 6: Dashboard Admin e KDS

> **Status**: 🔄 Não Iniciada  
> **Pré-requisito**: Fase 5 ✅ Concluída  
> **Tempo Estimado**: 5-7 horas  
> **Data Início**: -  
> **Data Conclusão**: -

---

## 📋 Visão Geral

Fase 6 consiste no desenvolvimento de 3 sistemas interconectados:

| Sistema | Usuário | Objetivo | Complexidade |
|---------|---------|----------|--------------|
| **KDS** | Cozinha | Exibição de pedidos em tempo real | 🟡 Média |
| **Dashboard** | Gerente | Métricas e visão geral | 🟡 Média |
| **Painel Control** | Admin | Gerenciar sistema | 🟢 Fácil |

---

## 🔧 SPRINT 1: Backend - WebSocket e Endpoints (2-3h)

### Arquitetura Backend

- [ ] Criar WebSocket Gateway (Socket.io)
- [ ] Configurar CORS para WebSocket
- [ ] Setup de salas (rooms) por tela:
  - [ ] `kds-cozinha`
  - [ ] `dashboard-gerente`
  - [ ] `admin-control`

### Endpoints REST - Dashboard

- [ ] `GET /admin/dashboard/metrics`
  - [ ] Total de pedidos (hoje)
  - [ ] Pedidos entregues
  - [ ] Faturamento total
  - [ ] Tempo médio

- [ ] `GET /admin/dashboard/revenue`
  - [ ] Vendas por hora
  - [ ] Vendas por dia da semana
  - [ ] Ticket médio

- [ ] `GET /admin/dashboard/top-items`
  - [ ] Itens mais vendidos
  - [ ] Quantidade e faturamento

### Endpoints REST - KDS

- [ ] `GET /admin/kds/orders`
  - [ ] Filtro por status (PENDING, PREPARING, READY)
  - [ ] Ordenação por tempo
  - [ ] Incluir detalhes do pedido

- [ ] `PUT /admin/kds/orders/:id/status`
  - [ ] Atualizar status do pedido
  - [ ] Emit WebSocket para atualizar KDS

- [ ] `GET /admin/kds/orders/history`
  - [ ] Pedidos completados do dia

### Endpoints REST - Painel de Controle

- [ ] `GET /admin/tables`
  - [ ] Listar todas as mesas com status

- [ ] `POST /admin/tables`
  - [ ] Criar mesa

- [ ] `PUT /admin/tables/:id`
  - [ ] Editar mesa

- [ ] `DELETE /admin/tables/:id`
  - [ ] Deletar mesa

- [ ] `GET /admin/users`
  - [ ] Listar usuários com roles

- [ ] `POST /admin/users`
  - [ ] Criar usuário

- [ ] `PUT /admin/users/:id`
  - [ ] Editar usuário

- [ ] `DELETE /admin/users/:id`
  - [ ] Deletar usuário

- [ ] `GET /admin/menu-items`
  - [ ] Listar itens do menu com categorias

- [ ] `POST /admin/menu-items`
  - [ ] Criar item

- [ ] `PUT /admin/menu-items/:id`
  - [ ] Editar item

- [ ] `DELETE /admin/menu-items/:id`
  - [ ] Deletar item

- [ ] `GET /admin/settings`
  - [ ] Configurações do sistema

- [ ] `PUT /admin/settings`
  - [ ] Atualizar configurações

### Guards e Autenticação

- [ ] Guard `@IsAdmin()` para rotas admin
- [ ] Guard `@IsManager()` para dashboard
- [ ] Guard `@IsKitchen()` para KDS
- [ ] Verificação de permissões em cada endpoint

### WebSocket Events

- [ ] `order:created` - Novo pedido criado
- [ ] `order:status-changed` - Status do pedido mudou
- [ ] `order:completed` - Pedido completo
- [ ] `kds:update` - Atualizar KDS
- [ ] `dashboard:metrics` - Atualizar métricas

---

## 🎨 SPRINT 2: Frontend Setup (1h)

### Projeto Next.js

- [ ] Criar novo projeto: `npx create-next-app@latest`
- [ ] Versão: Next.js 14+ (App Router)
- [ ] TypeScript: Sim
- [ ] Tailwind CSS: Sim
- [ ] ESLint: Sim

### Estrutura de Pastas

```
apps/
├─ frontend/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ login/
│  │  │  └─ register/
│  │  ├─ (admin)/
│  │  │  ├─ kds/
│  │  │  ├─ dashboard/
│  │  │  └─ control/
│  │  └─ api/
│  ├─ components/
│  │  ├─ KDS/
│  │  ├─ Dashboard/
│  │  ├─ ControlPanel/
│  │  ├─ Layout/
│  │  └─ Common/
│  ├─ lib/
│  │  ├─ api.ts
│  │  ├─ socket.ts
│  │  ├─ hooks.ts
│  │  └─ utils.ts
│  ├─ hooks/
│  │  ├─ useAuth.ts
│  │  ├─ useSocket.ts
│  │  └─ useDashboard.ts
│  ├─ store/
│  │  ├─ authSlice.ts
│  │  ├─ kdsSlice.ts
│  │  └─ dashboardSlice.ts
│  ├─ types/
│  │  ├─ api.ts
│  │  └─ entities.ts
│  └─ middleware.ts
```

- [ ] Instalação de dependências:
  - [ ] `socket.io-client`
  - [ ] `@reduxjs/toolkit` e `react-redux`
  - [ ] `@tanstack/react-query`
  - [ ] `recharts`
  - [ ] `shadcn/ui`
  - [ ] `next-auth`

### Autenticação

- [ ] Integração com NextAuth
- [ ] Providers: Credentials (email/password)
- [ ] JWT token configurado
- [ ] Redirecionar não autenticados para login
- [ ] Session management

### Tema Global

- [ ] Tailwind theme configurado
- [ ] Layout base (sidebar, header)
- [ ] Dark mode (opcional)
- [ ] Responsividade

---

## 🖥️ SPRINT 3: KDS (Kitchen Display System) (1.5h)

### Componente Principal - KDS View

- [ ] Criar componente `<KDSView />`
- [ ] Layout com 3 colunas:
  - [ ] PENDING (Pedidos novos)
  - [ ] PREPARING (Em preparação)
  - [ ] READY (Prontos para entregar)

- [ ] Cada coluna exibe cards com:
  - [ ] Número do pedido
  - [ ] Número da mesa
  - [ ] Itens do pedido
  - [ ] Observações especiais
  - [ ] Tempo decorrido
  - [ ] Botões de ação

### WebSocket Integration

- [ ] Conectar Socket.io na inicialização
- [ ] Juntar sala `kds-cozinha`
- [ ] Ouvir eventos:
  - [ ] `order:created` - Novo pedido
  - [ ] `order:status-changed` - Status mudou
  - [ ] `order:completed` - Pedido entregue

- [ ] Emitir eventos:
  - [ ] `order:start` - Começar a preparar
  - [ ] `order:ready` - Marcar como pronto
  - [ ] `order:delivered` - Entregar

### Funcionalidades

- [ ] Click em "COMEÇAR" muda status de PENDING → PREPARING
- [ ] Click em "PRONTO" muda status de PREPARING → READY
- [ ] Click em "ENTREGAR" muda status de READY → COMPLETED
- [ ] Drag & drop entre colunas (opcional)
- [ ] Sound notification ao receber novo pedido
- [ ] Filtro por tipo (bebidas, entrada, prato principal)
- [ ] Histórico de pedidos completados
- [ ] Busca por número de pedido/mesa

### UI/UX

- [ ] Design clean e intuitivo
- [ ] Cards com cores por status:
  - [ ] Vermelho: PENDING (urgente)
  - [ ] Amarelo: PREPARING
  - [ ] Verde: READY

- [ ] Fonte grande (legível de longe)
- [ ] Indicador de tempo visual (barra de progresso)
- [ ] Responsivo (tela cheia em desktop)

---

## 📊 SPRINT 4: Dashboard Gerente (1.5h)

### Layout Principal

- [ ] Header com:
  - [ ] Logo
  - [ ] Data/hora atual
  - [ ] Nome do gerente
  - [ ] Logout

- [ ] Sidebar com navegação:
  - [ ] Dashboard (ativo)
  - [ ] KDS (acesso)
  - [ ] Painel de Controle
  - [ ] Sair

### Cards de Métricas

- [ ] Card "Pedidos Hoje"
  - [ ] Total de pedidos
  - [ ] Entregues
  - [ ] Em preparação
  - [ ] Pendentes

- [ ] Card "Faturamento"
  - [ ] Total faturado
  - [ ] Ticket médio
  - [ ] Método mais usado

- [ ] Card "Mesas"
  - [ ] Total de mesas
  - [ ] Ocupadas
  - [ ] Disponíveis
  - [ ] Reservadas

- [ ] Card "Performance"
  - [ ] Tempo médio de pedido
  - [ ] Item mais vendido
  - [ ] Taxa de conclusão

### Gráficos

- [ ] Gráfico de Vendas (últimas 24h)
  - [ ] Eixo X: Horário
  - [ ] Eixo Y: Faturamento
  - [ ] Line chart com Recharts

- [ ] Gráfico de Tipos de Pagamento
  - [ ] Pie chart
  - [ ] CASH vs CREDIT_CARD vs PIX

- [ ] Gráfico de Itens Mais Vendidos
  - [ ] Bar chart
  - [ ] Top 5 itens
  - [ ] Quantidade vs Faturamento

### Tabelas

- [ ] Tabela de Últimos Pedidos
  - [ ] Colunas: #, Mesa, Itens, Total, Status, Horário
  - [ ] Ordenação clicável
  - [ ] Paginação

- [ ] Tabela de Mesas
  - [ ] Colunas: #, Área, Capacidade, Status, Ocupação%

### Filtros

- [ ] Filtro por período:
  - [ ] Hoje
  - [ ] Últimos 7 dias
  - [ ] Este mês
  - [ ] Customizado (range)

- [ ] Filtro por status de pedido
- [ ] Filtro por método de pagamento

### Real-time

- [ ] Métricas atualizam via WebSocket
- [ ] Gráficos atualizam a cada novo pedido
- [ ] Sem necessidade de refresh manual

---

## ⚙️ SPRINT 5: Painel de Controle (1h)

### Seção: Gerenciar Mesas

- [ ] Tabela de mesas com:
  - [ ] ID, Número, Área, Capacidade, Status

- [ ] Botões de ação:
  - [ ] Editar (modal com form)
  - [ ] Deletar (confirmação)

- [ ] Botão "Adicionar Mesa"
  - [ ] Form com: Número, Área, Capacidade
  - [ ] Validação de campos
  - [ ] Submit para backend

### Seção: Gerenciar Cardápio

- [ ] Categorias (Dropdown/Tabs)
  - [ ] Selecionar categoria
  - [ ] Listar itens dessa categoria

- [ ] Tabela de Itens
  - [ ] Colunas: Nome, Preço, Categoria, Status (ativo/inativo)

- [ ] Botões de ação:
  - [ ] Editar (modal)
  - [ ] Deletar (confirmação)
  - [ ] Toggle ativo/inativo

- [ ] Botão "Adicionar Item"
  - [ ] Form com: Nome, Descrição, Preço, Categoria, Foto
  - [ ] Upload de imagem

### Seção: Gerenciar Usuários

- [ ] Tabela de usuários
  - [ ] Colunas: Nome, Email, Role, Status (ativo/inativo)

- [ ] Botões de ação:
  - [ ] Editar (modal)
  - [ ] Deletar (confirmação)
  - [ ] Resetar senha

- [ ] Botão "Adicionar Usuário"
  - [ ] Form com: Nome, Email, Role, Senha
  - [ ] Roles: ADMIN, MANAGER, WAITER, KITCHEN, BAR

### Seção: Configurações

- [ ] Dados da Empresa
  - [ ] Nome, CNPJ, Telefone, Email, Endereço
  - [ ] Logo (upload)

- [ ] Horários de Funcionamento
  - [ ] Segunda a Domingo
  - [ ] Horário de abertura e fechamento

- [ ] Configurações Financeiras
  - [ ] Taxa de serviço (%)
  - [ ] Impostos
  - [ ] Formas de pagamento aceitas

- [ ] Integração n8n
  - [ ] URLs dos webhooks
  - [ ] Status de conexão

### UI/UX

- [ ] Forms com validação clara
- [ ] Modais para ações (editar/criar)
- [ ] Confirmações para deletar
- [ ] Loading states
- [ ] Toast notifications para sucesso/erro
- [ ] Tabelas com busca e filtro

---

## 🧪 SPRINT 6: Refinamento e Testes (0.5h)

### Performance

- [ ] Lazy loading de componentes grandes
- [ ] Memoização de componentes (React.memo)
- [ ] Otimização de imagens
- [ ] Compressão de bundle

### Responsividade

- [ ] Teste em desktop (1920x1080)
- [ ] Teste em tablet (768px)
- [ ] Teste em mobile (375px)
- [ ] Sidebar colapsável em mobile

### Testes Funcionais

- [ ] KDS: Criar pedido via Postman, verificar atualização em tempo real
- [ ] Dashboard: Verificar métricas ao criar pedido
- [ ] Painel de Controle: Criar/editar/deletar mesa, usuário, item
- [ ] WebSocket: Desconectar/reconectar

### Documentação

- [ ] README.md para Fase 6
- [ ] Instruções de setup
- [ ] Guia de uso (KDS, Dashboard, Painel)
- [ ] Troubleshooting

### Deploy

- [ ] Frontend rodando em http://localhost:3001
- [ ] Backend com WebSocket em http://localhost:3000
- [ ] Docker Compose atualizado com frontend

---

## 📊 Status Geral

| Sprint | Status | % |
|--------|--------|---|
| Sprint 1: Backend | ⏳ 0% | 🔴 |
| Sprint 2: Frontend Setup | ⏳ 0% | 🔴 |
| Sprint 3: KDS | ⏳ 0% | 🔴 |
| Sprint 4: Dashboard | ⏳ 0% | 🔴 |
| Sprint 5: Painel Control | ⏳ 0% | 🔴 |
| Sprint 6: Refinamento | ⏳ 0% | 🔴 |
| **TOTAL** | **⏳ 0%** | **🔴** |

---

## 📅 Cronograma Recomendado

- **Dia 1**: Sprint 1 + Sprint 2
- **Dia 2**: Sprint 3 + Sprint 4
- **Dia 3**: Sprint 5 + Sprint 6 + Deploy

---

## 🎯 Decisões Importantes

✅ **WebSocket em vez de Polling**: Melhor performance e UX
✅ **Next.js em app/**: Router moderno e performático
✅ **Tailwind CSS**: Design rápido e consistente
✅ **Redux Toolkit**: State management robusto
✅ **TypeScript**: Type safety em toda a aplicação

---

## 📚 Documentação de Referência

- [Next.js Docs](https://nextjs.org/docs)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

## 🚀 Próximas Fases

**Fase 7**: Frontend Cliente (Menu, Pedido Online, Acompanhamento)
**Fase 8**: Mobile App (React Native)
**Fase 9**: Integrações Premium (Google Maps, Uber Eats)

---

**Pronto para começar? Vamos iniciar Sprint 1!** 🎉
