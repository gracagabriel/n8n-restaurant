# 🚀 Fase 6: Dashboard Admin e KDS (Kitchen Display System)

> **Pré-requisito**: Fase 5 (Webhooks + n8n) concluída ✅

**Tempo estimado**: 5-7 horas  
**Resultado final**: Sistema administrativo completo com KDS para cozinha e Dashboard para gerente

---

## 📋 Índice

1. [O que é Fase 6](#o-que-é-fase-6)
2. [Arquitetura da Solução](#arquitetura-da-solução)
3. [Componentes a Desenvolver](#componentes-a-desenvolver)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Roadmap](#roadmap)

---

## 🎯 O que é Fase 6?

Fase 6 é o desenvolvimento de **sistemas administrativos internos** para gerenciar o restaurante em tempo real:

### **3 Sistemas Principais:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 6: ADMIN                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣  KDS (Kitchen Display System)                           │
│     └─ Tela na cozinha com pedidos em tempo real            │
│        Atualização automática                               │
│        Status: PENDING → PREPARING → READY                  │
│                                                              │
│  2️⃣  Dashboard Gerente                                       │
│     └─ Visão geral do restaurante                           │
│        Gráficos de vendas                                   │
│        Mesas ocupadas/disponíveis                           │
│        Financeiro em tempo real                             │
│                                                              │
│  3️⃣  Painel de Controle                                      │
│     └─ Gerenciar mesas                                      │
│        Gerenciar cardápio                                   │
│        Gerenciar usuários                                   │
│        Configurações do sistema                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (ADMIN)                         │
│                   Next.js + TypeScript                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   KDS View   │  │ Dashboard    │  │   Control    │      │
│  │  (Cozinha)   │  │ (Gerente)    │  │   Panel      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
└─────────────────────────────┼─────────────────────────────┘
                              │
                        REST API + WebSocket
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                    BACKEND (NestJS)                        │
├─────────────────────────────┼─────────────────────────────┤
│                             │                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │         WebSocket Gateway                          │   │
│  │   (Notificações em tempo real)                     │   │
│  │   - KDS atualização de pedidos                     │   │
│  │   - Dashboard métricas                             │   │
│  │   - Status de mesas                                │   │
│  └────────────────────────────────────────────────────┘   │
│                             │                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │         REST API Routes                            │   │
│  │   - GET /admin/dashboard/metrics                   │   │
│  │   - GET /admin/orders (filtrado por status)        │   │
│  │   - PUT /admin/orders/:id/status                   │   │
│  │   - GET /admin/tables (ocupação)                   │   │
│  │   - GET /admin/revenue (financeiro)                │   │
│  │   - POST /admin/menuItems (gerenciar cardápio)     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│              DATA LAYER (PostgreSQL + Redis)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Componentes a Desenvolver

### **1. KDS (Kitchen Display System) - Tela da Cozinha**

**O que é?**
Sistema que exibe pedidos em tempo real para a cozinha, organizado por status.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│          KDS - COZINHA - Restaurante Admin              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PENDING (3)        PREPARING (2)      READY (1)        │
│  ┌──────────┐       ┌──────────┐       ┌──────────┐     │
│  │ Ped #1   │       │ Ped #3   │       │ Ped #2   │     │
│  │ Mesa: 2  │       │ Mesa: 5  │       │ Mesa: 7  │     │
│  │ Itens: 3 │       │ Itens: 2 │       │ Itens: 1 │     │
│  │          │       │ ⏱️ 15min │       │ ✅ Pronto│     │
│  │ Obs: Sem │       │          │       │          │     │
│  │ cebola   │       │          │       │          │     │
│  └──────────┘       └──────────┘       └──────────┘     │
│       ↓                  ↓                   ↓            │
│   Clique aqui      Marcar como      Entregar para      │
│   para começar     pronto            garçom            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Exibição em tempo real (WebSocket)
- ✅ Abas por status (PENDING, PREPARING, READY)
- ✅ Click para mudar status
- ✅ Alarme visual/sonoro para novos pedidos
- ✅ Histórico de pedidos concluídos
- ✅ Filtro por tipo (bebidas, entrada, prato principal)

**Tecnologia:**
- React + Tailwind CSS
- WebSocket para atualizações
- Local Storage para histórico

---

### **2. Dashboard Gerente**

**O que é?**
Painel com métricas e informações essenciais para o gerente.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│     Dashboard - Gerente - Restaurante Admin          │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Status Geral (Hoje)                                 │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │Pedidos   │Mesas     │Faturado  │Tempo Med │      │
│  │Total: 23 │Ocupadas:5│R$ 1.245  │15 min   │      │
│  │Entregues:│Disponi:7 │          │         │      │
│  │20        │Reserved:2│          │         │      │
│  └──────────┴──────────┴──────────┴──────────┘      │
│                                                       │
│  Gráfico de Vendas (Últimas 24h)                     │
│  ┌────────────────────────────────────────────────┐  │
│  │                        ╱╲                       │  │
│  │      ╱╲    ╱╲   ╱╲   ╱  ╲   ╱╲                 │  │
│  │  ╱╲╱  ╲╱╲╱  ╲╱╲╱    ╱    ╲╱  ╲╱╲              │  │
│  │ 0:00  6:00 12:00 18:00  00:00                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  Itens Mais Vendidos                                 │
│  ┌──────────────┬────┬──────┐                       │
│  │ Item         │Qty │Fatur │                       │
│  ├──────────────┼────┼──────┤                       │
│  │ Hambúrguer   │ 8  │R$120 │                       │
│  │ Pizza        │ 6  │R$180 │                       │
│  │ Refrigerante │ 15 │R$45  │                       │
│  │ Cerveja      │ 12 │R$180 │                       │
│  └──────────────┴────┴──────┘                       │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Métricas em tempo real
- ✅ Gráficos de vendas
- ✅ Itens mais vendidos
- ✅ Comparativo com dias anteriores
- ✅ Tickets por método de pagamento
- ✅ Média de tempo por pedido

**Tecnologia:**
- React + Recharts (gráficos)
- Redux para estado global
- API REST para dados

---

### **3. Painel de Controle**

**O que é?**
Gerenciamento completo do sistema.

**Seções:**
1. **Gerenciar Mesas**
   - Criar, editar, deletar mesas
   - Ver status (Disponível, Ocupada, Reservada)
   - Área do restaurante

2. **Gerenciar Cardápio**
   - CRUD de categorias
   - CRUD de itens
   - Upload de fotos
   - Preços e estoque

3. **Gerenciar Usuários**
   - Criar, editar, deletar usuários
   - Definir roles (Admin, Manager, Waiter, Kitchen, Bar)
   - Ativar/desativar acesso

4. **Configurações**
   - Dados da empresa
   - Horários de funcionamento
   - Impostos e taxas
   - Integração com n8n

---

## 💻 Stack Tecnológico

### **Frontend:**
```
Next.js 14+ (App Router)
├─ TypeScript
├─ Tailwind CSS
├─ Shadcn/ui (componentes)
├─ React Query (cache/sincronização)
├─ Redux Toolkit (estado global)
├─ Socket.io-client (WebSocket)
├─ Recharts (gráficos)
└─ Next-Auth (autenticação)
```

### **Backend:**
```
NestJS v10+
├─ WebSocket Gateway (Socket.io)
├─ Guards de autenticação
├─ Prisma ORM
├─ Redis (cache)
└─ Rate Limiting
```

### **Deploy:**
```
Docker Compose (dev)
├─ Frontend: http://localhost:3001
├─ Backend: http://localhost:3000
├─ n8n: http://localhost:5678
├─ PostgreSQL: localhost:5432
└─ Redis: localhost:6379
```

---

## 📅 Roadmap

### **Sprint 1: Backend (2-3 horas)**
- [ ] WebSocket Gateway em NestJS
- [ ] Endpoints de dashboard
- [ ] Endpoints de KDS
- [ ] Endpoints de controle
- [ ] Autenticação e autorização
- [ ] Rate limiting

### **Sprint 2: Frontend Setup (1 hora)**
- [ ] Projeto Next.js criado
- [ ] Estrutura de pastas
- [ ] Configuração de autenticação
- [ ] Layout base

### **Sprint 3: KDS (1.5 horas)**
- [ ] Componente KDS
- [ ] WebSocket integrado
- [ ] Abas por status
- [ ] Ações de drag-drop (opcional)

### **Sprint 4: Dashboard (1.5 horas)**
- [ ] Componentes de métrica
- [ ] Gráficos de vendas
- [ ] Tabelas de dados
- [ ] Filtros por período

### **Sprint 5: Painel de Controle (1 hora)**
- [ ] CRUD de mesas
- [ ] CRUD de usuários
- [ ] CRUD de cardápio
- [ ] Configurações

### **Sprint 6: Refinamento (0.5 horas)**
- [ ] Testes
- [ ] Performance
- [ ] Responsividade
- [ ] Deploy

---

## 🎯 Decisões Arquiteturais Fase 6

### **1. KDS em Browser vs App Nativo**
✅ **Decisão**: Browser (React + WebSocket)
- **Vantagens**: Deploy mais fácil, atualizações automáticas, roda em qualquer PC
- **Custo**: Zero (não precisa de app store)

### **2. Impressora Térmica (Opcional)**
✅ **Integração via n8n**
- Quando novo pedido é criado → n8n webhook
- n8n conecta em impressora via USB/Rede
- Funciona offline (impressora em rede local)

### **3. Real-time vs Polling**
✅ **WebSocket (Socket.io)**
- Melhor latência
- Reduz carga do servidor
- Experiência melhor para usuário

### **4. Mobile vs Desktop**
✅ **Responsivo para ambos**
- KDS: Desktop (tela grande na cozinha)
- Dashboard: Mobile + Desktop (gerente pode acompanhar pelo celular)

---

## 🚀 Como Começar Fase 6

1. **Criar estrutura backend** com WebSocket Gateway
2. **Endpoints de admin** para dashboard/KDS
3. **Projeto Next.js** para frontend
4. **Componente KDS** com atualização em tempo real
5. **Dashboard** com métricas
6. **Painel de controle** para gerenciar sistema

---

## 📚 Próximas Fases Após Fase 6

### **Fase 7: Frontend Cliente**
- App Next.js para clientes
- Menu visualizável
- Pedido online
- Acompanhamento de pedido em tempo real
- Push Notifications

### **Fase 8: Mobile**
- App React Native / Flutter
- Funcionalidades: Menu, Pedido, Pagamento

### **Fase 9: Integrações Premium**
- Google Maps / Uber Eats
- Payment gateways
- CRM para fidelização

---

## ✅ Checklist Fase 6

Será criado um arquivo específico: `CHECKLIST_FASE_6.md`

---

**Pronto para começar Fase 6? Vamos criar o checklist e iniciar!** 🚀
