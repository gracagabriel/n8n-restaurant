# 🧪 Testes Sprint 1 - Backend WebSocket e Admin Endpoints

## Status: ✅ BACKEND COMPILADO E RODANDO

Backend está rodando em modo watch na porta 3000 com suporte a WebSocket Gateway e Admin endpoints.

---

## 📋 Testes a Realizar

### 1️⃣ Teste de Login (Obter JWT Token)

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Body:**
```json
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

**Response esperado:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@restaurant.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

**Guardar:** `accessToken` para usar nos próximos testes.

---

### 2️⃣ Teste: Dashboard Metrics

**Endpoint:** `GET http://localhost:3000/api/admin/dashboard/metrics`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response esperado:**
```json
{
  "totalOrders": 0,
  "totalRevenue": 0,
  "tableOccupancy": 0,
  "averageOrderTime": 0
}
```

**Guard:** ✅ Requer Manager+ (acesso com ADMIN funcionará)

---

### 3️⃣ Teste: KDS Orders (Pedidos Pendentes)

**Endpoint:** `GET http://localhost:3000/api/admin/kds/orders?status=PENDING`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response esperado:** Array vazio (não há pedidos ainda)

**Guard:** ✅ Requer Kitchen+ (acesso com ADMIN funcionará)

---

### 4️⃣ Teste: Top Items

**Endpoint:** `GET http://localhost:3000/api/admin/dashboard/top-items?limit=5`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response esperado:** Array vazio ou com itens mais vendidos

---

### 5️⃣ Teste: Tables Status

**Endpoint:** `GET http://localhost:3000/api/admin/tables`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response esperado:**
```json
[
  {
    "id": "table_id",
    "tableNumber": 1,
    "capacity": 4,
    "status": "AVAILABLE",
    "currentOrderId": null
  },
  ...
]
```

---

### 6️⃣ Teste: WebSocket Connection

**URL:** `http://localhost:3000/admin`

**JavaScript Client:**
```javascript
const socket = io('http://localhost:3000', {
  namespace: '/admin',
  extraHeaders: {
    Authorization: `Bearer ${accessToken}`
  }
});

socket.on('connect', () => {
  console.log('WebSocket conectado!');
});

socket.on('orderCreated', (data) => {
  console.log('Novo pedido:', data);
});

socket.on('orderStatusChanged', (data) => {
  console.log('Status atualizado:', data);
});
```

---

## 🛠️ Próximos Passos

### Sprint 1 Completo ✅
- [x] Dependencies instaladas
- [x] EventsGateway criada
- [x] Authorization Guards criadas
- [x] AdminService criada com 8 métodos
- [x] AdminController criada com 10 endpoints
- [x] AdminModule criada
- [x] app.module.ts atualizada
- [x] Build sem erros
- [x] Server rodando em watch mode
- [ ] Testes manuais (Você fará via Postman)
- [ ] Testes de WebSocket (opcional - faremos em Sprint 2)

### Sprint 2 (Próxima)
- Criar projeto Next.js em `apps/frontend`
- Setup TypeScript, Tailwind, Socket.io-client
- Criar layout base e autenticação
- Conectar ao WebSocket

---

## 📌 Informações Importantes

**Credenciais de Teste:**
- Email: `admin@restaurant.com`
- Senha: `admin123`

**URLs:**
- Backend: `http://localhost:3000`
- Frontend (próxima): `http://localhost:3001`
- n8n: `http://localhost:5678`

**Terminal Watch Mode:**
- Backend está em watch mode (reinicia automaticamente ao salvar)
- Pressione Ctrl+C para parar se necessário

---

## 🎯 Arquitetura Fase 6

```
Frontend (Next.js 14)
├── KDS (Kitchen Display System) - Coluna 3 status
├── Dashboard (Admin) - Métricas e gráficos  
└── Control Panel - CRUD de mesas, cardápio, usuários

Backend (NestJS + WebSocket)
├── EventsGateway - Emissão de eventos em tempo real
├── AdminService - Lógica de dashboard, KDS, mesas
├── AuthGuard - Proteção de rotas
└── EventsService - Webhooks para n8n (Fase 5)
```

---

## 💡 Observações

1. **Guard de Roles:** Cada endpoint verifica `user.role` automaticamente
2. **WebSocket:** Eventos emitidos via `socket.io` para clientes conectados
3. **Database:** Usa Prisma ORM com PostgreSQL
4. **n8n:** Integração de webhooks continua ativa da Fase 5

---

**Data de Início Sprint 1:** [Hoje]  
**Status:** Pronto para testes manuais via Postman
