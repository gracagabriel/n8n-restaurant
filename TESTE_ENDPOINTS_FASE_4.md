# 📋 Teste de Endpoints - Fase 4 (Orders & Payments)

> **Status**: ✅ Servidor iniciado com sucesso em `http://localhost:3000`

---

## 🔑 Passo 1: Autenticação

Antes de testar qualquer endpoint, você precisa de um token JWT.

### 1.1 - Login (obter token)

**Endpoint:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@restaurant.local",
  "password": "admin123"
}
```

**Resposta esperada (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@restaurant.local",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**⚠️ Salve o `accessToken`** - você vai precisar dele para os próximos testes.

---

## 📦 Passo 2: Preparar Dados (Pré-requisitos)

Antes de criar um pedido, você precisa de:
- ✅ Uma **mesa** disponível
- ✅ Um **item do menu** para adicionar ao pedido

### 2.1 - Obter mesa disponível

**Endpoint:**
```
GET http://localhost:3000/api/tables?status=AVAILABLE
Authorization: Bearer {seu_accessToken}
```

**Resposta esperada (200):**
```json
[
  {
    "id": "table-uuid-1",
    "number": 1,
    "capacity": 4,
    "status": "AVAILABLE",
    "location": "Perto da janela",
    "createdAt": "2024-01-19T...",
    "updatedAt": "2024-01-19T..."
  },
  ...
]
```

**⚠️ Salve o `id` da mesa** (primeira mesa na lista)

### 2.2 - Obter item do menu

**Endpoint:**
```
GET http://localhost:3000/api/menu-items?skip=0&take=5
Authorization: Bearer {seu_accessToken}
```

**Resposta esperada (200):**
```json
[
  {
    "id": "item-uuid-1",
    "name": "Hambúrguer Gourmet",
    "description": "Pão artesanal com carne de qualidade",
    "price": 45.90,
    "categoryId": "category-uuid",
    "image": "https://...",
    "createdAt": "2024-01-19T...",
    "updatedAt": "2024-01-19T..."
  },
  ...
]
```

**⚠️ Salve o `id` do item do menu** (primeiro item na lista)

---

## 🛒 Passo 3: Criar Pedido

### 3.1 - Criar novo pedido

**Endpoint:**
```
POST http://localhost:3000/api/orders
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "tableId": "{id_da_mesa_obtido_em_2.1}",
  "notes": "Sem cebola, extra bacon"
}
```

**Resposta esperada (201):**
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1705700000000-123",
  "tableId": "table-uuid-1",
  "userId": "user-uuid",
  "status": "PENDING",
  "notes": "Sem cebola, extra bacon",
  "items": [],
  "createdAt": "2024-01-19T...",
  "updatedAt": "2024-01-19T...",
  "table": {
    "id": "table-uuid-1",
    "number": 1,
    "capacity": 4,
    "status": "AVAILABLE"
  },
  "user": {
    "id": "user-uuid",
    "name": "Admin User",
    "email": "admin@restaurant.local"
  }
}
```

**⚠️ Salve o `id` do pedido** - será usado em praticamente todos os testes seguintes

---

## 🍕 Passo 4: Adicionar Itens ao Pedido

### 4.1 - Adicionar primeiro item

**Endpoint:**
```
POST http://localhost:3000/api/orders/{id_do_pedido}/items
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "menuItemId": "{id_do_item_obtido_em_2.2}",
  "quantity": 2
}
```

**Resposta esperada (201):**
```json
{
  "id": "orderitem-uuid-1",
  "orderId": "order-uuid",
  "menuItemId": "item-uuid-1",
  "quantity": 2,
  "price": 45.90,
  "createdAt": "2024-01-19T...",
  "menuItem": {
    "id": "item-uuid-1",
    "name": "Hambúrguer Gourmet",
    "price": 45.90
  }
}
```

### 4.2 - Adicionar mais um item (opcional)

**Endpoint:**
```
POST http://localhost:3000/api/orders/{id_do_pedido}/items
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "menuItemId": "{outro_id_de_item}",
  "quantity": 1
}
```

---

## 💰 Passo 5: Consultar Total do Pedido

### 5.1 - Calcular total

**Endpoint:**
```
GET http://localhost:3000/api/orders/{id_do_pedido}/total
Authorization: Bearer {seu_accessToken}
```

**Resposta esperada (200):**
```json
{
  "orderId": "order-uuid",
  "total": 91.80
}
```

**Explicação**: 2 × 45.90 = 91.80

---

## 📊 Passo 6: Atualizar Status do Pedido

Os status válidos seguem esta sequência:
```
PENDING → CONFIRMED → PREPARING → READY → SERVED → PAID
```

Você só pode transicionar para status válidos.

### 6.1 - Confirmar pedido (PENDING → CONFIRMED)

**Endpoint:**
```
PUT http://localhost:3000/api/orders/{id_do_pedido}/status
Authorization: Bearer {seu_accessToken} (requer ADMIN, MANAGER, KITCHEN ou BAR)
Content-Type: application/json
```

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Resposta esperada (200):**
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1705700000000-123",
  "tableId": "table-uuid-1",
  "userId": "user-uuid",
  "status": "CONFIRMED",
  "notes": "Sem cebola, extra bacon",
  "items": [
    {
      "id": "orderitem-uuid-1",
      "quantity": 2,
      "price": 45.90,
      "menuItem": {
        "id": "item-uuid-1",
        "name": "Hambúrguer Gourmet"
      }
    }
  ],
  "createdAt": "2024-01-19T...",
  "updatedAt": "2024-01-19T..."
}
```

### 6.2 - Enviando para cozinha (CONFIRMED → PREPARING)

**Endpoint:**
```
PUT http://localhost:3000/api/orders/{id_do_pedido}/status
Authorization: Bearer {seu_accessToken} (requer ADMIN, MANAGER, KITCHEN ou BAR)
Content-Type: application/json
```

**Body:**
```json
{
  "status": "PREPARING"
}
```

### 6.3 - Pronto (PREPARING → READY)

**Endpoint:**
```
PUT http://localhost:3000/api/orders/{id_do_pedido}/status
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "READY"
}
```

### 6.4 - Servido (READY → SERVED)

**Endpoint:**
```
PUT http://localhost:3000/api/orders/{id_do_pedido}/status
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "SERVED"
}
```

---

## 💳 Passo 7: Criar Pagamento

Você só pode criar um pagamento para pedidos em status `SERVED`.

### 7.1 - Criar pagamento

**Endpoint:**
```
POST http://localhost:3000/api/payments
Authorization: Bearer {seu_accessToken} (requer ADMIN, MANAGER ou WAITER)
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "{id_do_pedido}",
  "amount": 91.80,
  "method": "CARD",
  "notes": "Aprovado"
}
```

**Métodos válidos:**
- `CASH` - Dinheiro
- `CARD` - Cartão de crédito/débito
- `PIX` - Transferência PIX
- `TRANSFER` - Transferência bancária

**Resposta esperada (201):**
```json
{
  "id": "payment-uuid",
  "orderId": "order-uuid",
  "amount": 91.80,
  "method": "CARD",
  "status": "PENDING",
  "notes": "Aprovado",
  "paidAt": null,
  "createdAt": "2024-01-19T...",
  "updatedAt": "2024-01-19T...",
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-1705700000000-123",
    "items": [...]
  }
}
```

**⚠️ Salve o `id` do pagamento** - será usado para confirmar

---

## ✅ Passo 8: Confirmar Pagamento

### 8.1 - Confirmar pagamento

**Endpoint:**
```
PUT http://localhost:3000/api/payments/{id_do_pagamento}/confirm
Authorization: Bearer {seu_accessToken} (requer ADMIN, MANAGER ou WAITER)
```

**Resposta esperada (200):**
```json
{
  "id": "payment-uuid",
  "orderId": "order-uuid",
  "amount": 91.80,
  "method": "CARD",
  "status": "CONFIRMED",
  "notes": "Aprovado",
  "paidAt": "2024-01-19T16:20:00.000Z",
  "createdAt": "2024-01-19T16:19:00.000Z",
  "updatedAt": "2024-01-19T16:20:00.000Z"
}
```

**Nota importante**: Quando um pagamento é confirmado, o pedido automaticamente muda para status `PAID`.

---

## 🔍 Passo 9: Consultar Pedido Completo

### 9.1 - Obter detalhes do pedido (com pagamento)

**Endpoint:**
```
GET http://localhost:3000/api/orders/{id_do_pedido}
Authorization: Bearer {seu_accessToken}
```

**Resposta esperada (200):**
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1705700000000-123",
  "tableId": "table-uuid-1",
  "userId": "user-uuid",
  "status": "PAID",
  "notes": "Sem cebola, extra bacon",
  "items": [
    {
      "id": "orderitem-uuid-1",
      "quantity": 2,
      "price": 45.90,
      "menuItem": {
        "id": "item-uuid-1",
        "name": "Hambúrguer Gourmet",
        "price": 45.90
      }
    }
  ],
  "payment": {
    "id": "payment-uuid",
    "amount": 91.80,
    "method": "CARD",
    "status": "CONFIRMED",
    "paidAt": "2024-01-19T16:20:00.000Z"
  },
  "table": {...},
  "user": {...},
  "createdAt": "2024-01-19T...",
  "updatedAt": "2024-01-19T..."
}
```

---

## 📋 Passo 10: Listar Pedidos

### 10.1 - Listar todos os pedidos

**Endpoint:**
```
GET http://localhost:3000/api/orders?skip=0&take=20
Authorization: Bearer {seu_accessToken}
```

**Resposta esperada (200):**
```json
[
  {
    "id": "order-uuid-1",
    "orderNumber": "ORD-1705700000000-123",
    "status": "PAID",
    "items": [...],
    "table": {...},
    "user": {...},
    "payment": {...},
    ...
  },
  ...
]
```

### 10.2 - Filtrar por status

**Endpoint:**
```
GET http://localhost:3000/api/orders?status=PENDING&skip=0&take=20
Authorization: Bearer {seu_accessToken}
```

### 10.3 - Filtrar por mesa

**Endpoint:**
```
GET http://localhost:3000/api/orders?tableId={id_da_mesa}&skip=0&take=20
Authorization: Bearer {seu_accessToken}
```

---

## 💰 Passo 11: Listar Pagamentos

### 11.1 - Listar todos os pagamentos

**Endpoint:**
```
GET http://localhost:3000/api/payments?skip=0&take=20
Authorization: Bearer {seu_accessToken} (requer ADMIN, MANAGER ou WAITER)
```

**Resposta esperada (200):**
```json
[
  {
    "id": "payment-uuid",
    "amount": 91.80,
    "method": "CARD",
    "status": "CONFIRMED",
    "paidAt": "2024-01-19T...",
    "order": {
      "id": "order-uuid",
      "orderNumber": "ORD-1705700000000-123"
    },
    ...
  },
  ...
]
```

### 11.2 - Filtrar por status

**Endpoint:**
```
GET http://localhost:3000/api/payments?status=CONFIRMED&skip=0&take=20
Authorization: Bearer {seu_accessToken} (requer ADMIN, MANAGER ou WAITER)
```

---

## 📊 Passo 12: Relatório de Pagamentos

### 12.1 - Obter resumo de pagamentos por período

**Endpoint:**
```
GET http://localhost:3000/api/payments/summary?startDate=2024-01-19&endDate=2024-01-19
Authorization: Bearer {seu_accessToken} (requer ADMIN ou MANAGER)
```

**Resposta esperada (200):**
```json
{
  "period": {
    "startDate": "2024-01-19T00:00:00.000Z",
    "endDate": "2024-01-19T23:59:59.999Z"
  },
  "totalAmount": 183.60,
  "totalTransactions": 2,
  "byMethod": {
    "CARD": 91.80,
    "CASH": 91.80
  }
}
```

---

## 🧪 Testes de Validação

### Teste 1: Pagamento com valor inválido

**Cenário**: Tentar criar pagamento com valor negativo

**Endpoint:**
```
POST http://localhost:3000/api/payments
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "{id_do_pedido}",
  "amount": -50,
  "method": "CARD"
}
```

**Resposta esperada (400):**
```json
{
  "message": "Valor do pagamento deve ser maior que zero",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Teste 2: Pagamento acima do total

**Cenário**: Tentar pagar mais que o valor total do pedido

**Endpoint:**
```
POST http://localhost:3000/api/payments
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "{id_do_pedido}",
  "amount": 500,
  "method": "CARD"
}
```

**Resposta esperada (400):**
```json
{
  "message": "Valor do pagamento não pode exceder o total do pedido (R$ 91.80)",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Teste 3: Método de pagamento inválido

**Cenário**: Tentar usar método de pagamento inválido

**Endpoint:**
```
POST http://localhost:3000/api/payments
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "{id_do_pedido}",
  "amount": 91.80,
  "method": "BITCOIN"
}
```

**Resposta esperada (400):**
```json
{
  "message": "Método de pagamento inválido. Use: CASH, CARD, TRANSFER, PIX",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Teste 4: Transição de status inválida

**Cenário**: Tentar mudar de status não permitido

**Endpoint:**
```
PUT http://localhost:3000/api/orders/{id_do_pedido}/status
Authorization: Bearer {seu_accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "READY"
}
```

(Quando o pedido está em status PENDING, não pode pular direto para READY)

**Resposta esperada (400):**
```json
{
  "message": "Não é possível mudar de PENDING para READY",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## ✅ Checklist de Testes Fase 4

- [ ] Login (obter token)
- [ ] Listar mesas disponíveis
- [ ] Listar itens do menu
- [ ] Criar novo pedido
- [ ] Adicionar item(ns) ao pedido
- [ ] Consultar total do pedido
- [ ] Atualizar status: PENDING → CONFIRMED
- [ ] Atualizar status: CONFIRMED → PREPARING
- [ ] Atualizar status: PREPARING → READY
- [ ] Atualizar status: READY → SERVED
- [ ] Criar pagamento (com valor correto)
- [ ] Confirmar pagamento
- [ ] Obter detalhes do pedido (verificar status PAID)
- [ ] Listar todos os pedidos
- [ ] Listar todos os pagamentos
- [ ] Obter resumo de pagamentos
- [ ] Teste: Pagamento com valor negativo (deve falhar)
- [ ] Teste: Pagamento acima do total (deve falhar)
- [ ] Teste: Método de pagamento inválido (deve falhar)
- [ ] Teste: Transição de status inválida (deve falhar)

---

## 🚀 Próximos Passos

Após completar todos os testes da Fase 4:

1. **Fase 5**: Integração com n8n para automações
2. **Fase 6**: Dashboard Admin com gráficos e analytics
3. **Fase 7**: Frontend com Next.js

---

**Desenvolvido com ❤️ para seu sucesso**
