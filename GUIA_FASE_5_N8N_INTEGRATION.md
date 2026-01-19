# 🤖 Fase 5: Integração com n8n - Automações e Webhooks

> **Pré-requisito**: Você completou a Fase 4 (Orders & Payments) com sucesso ✅

**Tempo estimado**: 4-5 horas  
**Resultado final**: Sistema de automações completo com notificações via email, SMS e webhooks em tempo real

---

## 📋 Índice

1. [O que é n8n](#o-que-é-n8n)
2. [Arquitetura de Integração](#arquitetura-de-integração)
3. [Passo 1: Webhooks no Backend](#passo-1-webhooks-no-backend)
4. [Passo 2: Eventos Disparadores](#passo-2-eventos-disparadores)
5. [Passo 3: Configurar n8n](#passo-3-configurar-n8n)
6. [Passo 4: Workflows de Automação](#passo-4-workflows-de-automação)
7. [Passo 5: Integrações Externas](#passo-5-integrações-externas)
8. [Testar Automações](#testar-automações)

---

## 🎯 O que é n8n?

**n8n** é uma plataforma de automação de workflows que permite conectar diferentes aplicações e serviços sem escrever código (low-code).

### Funcionamento Básico

```
Backend                 n8n                 Serviços Externos
┌──────────┐           ┌────────┐          ┌──────────────┐
│ Criar    │──webhook──│Webhook │          │              │
│ Pedido   │           │Trigger │──────────│ SendGrid      │ (Email)
│          │           │        │          │              │
└──────────┘           ├────────┤          └──────────────┘
                       │ Filter │
┌──────────┐           │ Data   │          ┌──────────────┐
│Confirmar │──webhook──├────────┤          │              │
│Pagamento │           │ Format │──────────│ Twilio       │ (SMS)
│          │           │        │          │              │
└──────────┘           └────────┘          └──────────────┘
```

### Benefícios

✅ **Automações sem código** - Configure fluxos via UI  
✅ **Notificações em tempo real** - Email, SMS, push  
✅ **Integrações ilimitadas** - 400+ nós disponíveis  
✅ **Monitoramento** - Logs de execução, tratamento de erros  
✅ **Escalável** - Funciona com eventos de alto volume  

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENTE (POSTMAN)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND (NestJS)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Orders Service          Payments Service            │  │
│  │ ├─ Create Order         ├─ Create Payment           │  │
│  │ ├─ Update Status        ├─ Confirm Payment          │  │
│  │ └─ Cancel Order         └─ Cancel Payment           │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                    WEBHOOK DISPATCHER                        │
│        (Dispara eventos para n8n)                            │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                   HTTP POST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    n8n (AUTOMAÇÕES)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Workflow: Novo Pedido                               │  │
│  │ ├─ Trigger: Webhook                                 │  │
│  │ ├─ Filter: Validar dados                            │  │
│  │ ├─ SendGrid: Enviar email para gerente              │  │
│  │ └─ Twilio: Enviar SMS para cozinha                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Workflow: Pagamento Confirmado                       │  │
│  │ ├─ Trigger: Webhook                                 │  │
│  │ ├─ Filter: Status = COMPLETED                       │  │
│  │ ├─ SendGrid: Notificar cliente                      │  │
│  │ └─ Google Sheets: Registrar venda                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Workflow: Relatório Diário                           │  │
│  │ ├─ Trigger: Schedule (8:00 AM)                       │  │
│  │ ├─ Query: Buscar pedidos do dia                      │  │
│  │ ├─ Format: Criar relatório                          │  │
│  │ └─ SendGrid: Enviar para admin                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌─────────┐
    │SendGrid│      │ Twilio │      │G Sheets │
    │(Email) │      │(SMS)   │      │Reports  │
    └────────┘      └────────┘      └─────────┘
```

---

## PASSO 1️⃣: Webhooks no Backend

Vamos criar um serviço de notificações que dispara webhooks para n8n.

### 1.1 - Criar arquivo `events.service.ts`

**Caminho:**
```bash
mkdir -p C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\events
```

**Arquivo:** `events.service.ts`

```typescript
// ==========================================
// Events Service - Webhook Dispatcher
// ==========================================

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly webhookUrls: Record<string, string> = {
    orderCreated: process.env.WEBHOOK_ORDER_CREATED || '',
    orderStatusUpdated: process.env.WEBHOOK_ORDER_STATUS_UPDATED || '',
    orderCancelled: process.env.WEBHOOK_ORDER_CANCELLED || '',
    paymentCreated: process.env.WEBHOOK_PAYMENT_CREATED || '',
    paymentConfirmed: process.env.WEBHOOK_PAYMENT_CONFIRMED || '',
    paymentFailed: process.env.WEBHOOK_PAYMENT_FAILED || '',
  };

  /**
   * Disparar evento de webhook
   */
  async dispatchWebhook(event: string, payload: any): Promise<void> {
    const webhookUrl = this.webhookUrls[event];

    if (!webhookUrl) {
      this.logger.warn(`Webhook URL não configurada para evento: ${event}`);
      return;
    }

    const webhookPayload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    try {
      this.logger.log(`Disparando webhook para ${event} em ${webhookUrl}`);

      await axios.post(webhookUrl, webhookPayload, {
        timeout: 5000, // 5 segundos
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': webhookPayload.timestamp,
        },
      });

      this.logger.log(`Webhook disparado com sucesso para ${event}`);
    } catch (error) {
      // Não falhar a request se webhook falhar
      // n8n pode estar offline temporariamente
      this.logger.error(
        `Erro ao disparar webhook para ${event}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }

  /**
   * Disparar evento: Novo Pedido Criado
   */
  async onOrderCreated(order: any): Promise<void> {
    await this.dispatchWebhook('orderCreated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      userId: order.userId,
      totalItems: order.items?.length || 0,
      totalAmount: order.items?.reduce(
        (sum: number, item: any) => sum + item.unitPrice * item.quantity,
        0,
      ) || 0,
      createdAt: order.createdAt,
    });
  }

  /**
   * Disparar evento: Status do Pedido Atualizado
   */
  async onOrderStatusUpdated(order: any, oldStatus: string): Promise<void> {
    await this.dispatchWebhook('orderStatusUpdated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus: order.status,
      tableId: order.tableId,
      updatedAt: order.updatedAt,
    });
  }

  /**
   * Disparar evento: Pedido Cancelado
   */
  async onOrderCancelled(order: any): Promise<void> {
    await this.dispatchWebhook('orderCancelled', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      cancelledAt: new Date().toISOString(),
      reason: order.notes || 'Sem motivo especificado',
    });
  }

  /**
   * Disparar evento: Pagamento Criado
   */
  async onPaymentCreated(payment: any): Promise<void> {
    await this.dispatchWebhook('paymentCreated', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    });
  }

  /**
   * Disparar evento: Pagamento Confirmado
   */
  async onPaymentConfirmed(payment: any): Promise<void> {
    await this.dispatchWebhook('paymentConfirmed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      confirmedAt: new Date().toISOString(),
    });
  }

  /**
   * Disparar evento: Pagamento Falhou
   */
  async onPaymentFailed(payment: any, reason: string): Promise<void> {
    await this.dispatchWebhook('paymentFailed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      reason,
      failedAt: new Date().toISOString(),
    });
  }
}
```

### 1.2 - Criar arquivo `events.module.ts`

**Arquivo:** `events.module.ts`

```typescript
// ==========================================
// Events Module
// ==========================================

import { Module } from '@nestjs/common';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
```

---

## PASSO 2️⃣: Eventos Disparadores

Agora vamos integrar o `EventsService` nos controllers de Orders e Payments para disparar webhooks.

### 2.1 - Atualizar `orders.controller.ts`

Adicione o `EventsService` no construtor e dispare webhooks nos métodos relevantes.

**Localizar:**
```typescript
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
```

**Substituir por:**
```typescript
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly eventsService: EventsService,
  ) {}
```

**No método `create()`:**

Adicionar após criar o pedido:
```typescript
async create(
  @Body() body: { tableId: string; notes?: string },
  @Request() req,
) {
  const order = await this.ordersService.create({
    tableId: body.tableId,
    userId: req.user.id,
    notes: body.notes,
  });

  // Disparar webhook
  await this.eventsService.onOrderCreated(order);

  return order;
}
```

**No método `updateStatus()`:**

Adicionar após atualizar o status:
```typescript
async updateStatus(
  @Param('id') id: string,
  @Body() body: { status: string },
) {
  const order = await this.ordersService.findById(id);
  const oldStatus = order.status;

  const updated = await this.ordersService.updateStatus(id, body.status);

  // Disparar webhook
  await this.eventsService.onOrderStatusUpdated(updated, oldStatus);

  return updated;
}
```

**No método `cancel()`:**

```typescript
async cancel(@Param('id') id: string) {
  const order = await this.ordersService.findById(id);
  const cancelled = await this.ordersService.cancel(id);

  // Disparar webhook
  await this.eventsService.onOrderCancelled(cancelled);

  return cancelled;
}
```

### 2.2 - Atualizar `payments.controller.ts`

**No método `create()`:**

```typescript
async create(
  @Body() body: { orderId: string; amount: number; method: string },
  @Request() req,
) {
  const payment = await this.paymentsService.create({
    orderId: body.orderId,
    amount: body.amount,
    method: body.method,
    userId: req.user.id,
  });

  // Disparar webhook
  await this.eventsService.onPaymentCreated(payment);

  return payment;
}
```

**No método `confirm()`:**

```typescript
async confirm(@Param('id') id: string) {
  const payment = await this.paymentsService.findById(id);
  const confirmed = await this.paymentsService.confirm(id);

  // Disparar webhook
  await this.eventsService.onPaymentConfirmed(confirmed);

  return confirmed;
}
```

**No método `cancel()`:**

```typescript
async cancel(
  @Param('id') id: string,
  @Body() body: { reason?: string },
) {
  const payment = await this.paymentsService.findById(id);
  const cancelled = await this.paymentsService.cancel(id);

  // Disparar webhook
  await this.eventsService.onPaymentFailed(cancelled, body.reason || '');

  return cancelled;
}
```

---

## PASSO 3️⃣: Configurar n8n

### 3.1 - Acessar n8n

n8n já está rodando em Docker Compose. Acesse:

```
http://localhost:5678
```

### 3.2 - Primeiro Acesso

1. Clique em "Set up your n8n instance"
2. Crie uma conta (email e senha)
3. Configure a URL de base:
   - **Webhook Base URL**: `http://host.docker.internal:3000` (no Docker)
   - Ou `http://localhost:3000` (se rodar localmente)

### 3.3 - Configurar Webhooks do Backend

No arquivo `.env` do backend, adicione:

```env
# n8n Webhooks
WEBHOOK_ORDER_CREATED=http://localhost:5678/webhook/order-created
WEBHOOK_ORDER_STATUS_UPDATED=http://localhost:5678/webhook/order-status-updated
WEBHOOK_ORDER_CANCELLED=http://localhost:5678/webhook/order-cancelled
WEBHOOK_PAYMENT_CREATED=http://localhost:5678/webhook/payment-created
WEBHOOK_PAYMENT_CONFIRMED=http://localhost:5678/webhook/payment-confirmed
WEBHOOK_PAYMENT_FAILED=http://localhost:5678/webhook/payment-failed

# SendGrid (para envio de emails)
SENDGRID_API_KEY=sua_chave_aqui

# Twilio (para envio de SMS)
TWILIO_ACCOUNT_SID=sua_chave_aqui
TWILIO_AUTH_TOKEN=sua_token_aqui
TWILIO_PHONE_NUMBER=+1234567890
```

---

## PASSO 4️⃣: Workflows de Automação

### 4.1 - Workflow: Novo Pedido Criado

**Passo a Passo:**

1. **Criar novo Workflow**
   - Clique em "New Workflow" ou "+" no dashboard
   - Nome: "Novo Pedido - Notificações"

2. **Adicionar Trigger: Webhook**
   - Clique em "Add Node" ou "+"
   - Procure por "Webhook"
   - Selecione "Webhook"
   - Method: POST
   - Path: `/order-created` (será `http://localhost:5678/webhook/order-created`)
   - Clique em "Execute Node" para ativar
   - Copie a URL gerada

3. **Integrar no Backend**
   - Copie a URL completa do webhook
   - Adicione no `.env`: `WEBHOOK_ORDER_CREATED=<URL_copiada>`
   - Reinicie o backend

4. **Adicionar Node: Filter**
   - Clique em "+" para adicionar próximo nó
   - Procure por "Filter"
   - Condition: `data.totalItems > 0`
   - Isso valida se o pedido tem itens

5. **Adicionar Node: SendGrid (Email)**
   - Procure por "SendGrid"
   - Selecione "SendGrid - Email"
   - Authenticate: Cole sua chave API
   - To Email: `gerente@restaurante.com`
   - Subject: `Novo pedido recebido! #{{$node.Webhook.json.data.orderNumber}}`
   - Text: 
     ```
     Mesa: {{$node.Webhook.json.data.tableId}}
     Total de itens: {{$node.Webhook.json.data.totalItems}}
     Valor: R$ {{$node.Webhook.json.data.totalAmount}}
     ```

6. **Adicionar Node: Twilio (SMS)**
   - Procure por "Twilio"
   - Selecione "Twilio - Send SMS"
   - Authenticate: SID, Token, Phone
   - To Number: `+55XXXXXXXXXXX` (gerente)
   - Message:
     ```
     Novo pedido! Mesa {{$node.Webhook.json.data.tableId}} | Itens: {{$node.Webhook.json.data.totalItems}}
     ```

7. **Salvar e Ativar**
   - Clique em "Save"
   - Clique em "Activate" (botão no topo direito)

### 4.2 - Workflow: Pagamento Confirmado

**Passo a Passo:**

1. **Criar novo Workflow**
   - Nome: "Pagamento Confirmado - Notificação"

2. **Webhook Trigger**
   - Path: `/payment-confirmed`

3. **Filter**
   - Condition: Validar se `data.amount > 0`

4. **SendGrid - Email para Cliente**
   - To Email: `cliente@email.com` (será dinâmico depois)
   - Subject: `Pagamento Confirmado!`
   - Text:
     ```
     Seu pagamento de R$ {{$node.Webhook.json.data.amount}} foi confirmado!
     Pedido: {{$node.Webhook.json.data.orderId}}
     Método: {{$node.Webhook.json.data.method}}
     ```

5. **Google Sheets (Opcional - Registrar Venda)**
   - Procure por "Google Sheets"
   - Authenticate com Google
   - Spreadsheet: "Vendas"
   - Range: "A1"
   - Append:
     ```json
     [
       "{{$node.Webhook.json.data.orderId}}",
       "{{$node.Webhook.json.data.amount}}",
       "{{$node.Webhook.json.data.method}}",
       "{{$node.Webhook.json.timestamp}}"
     ]
     ```

6. **Salvar e Ativar**

### 4.3 - Workflow: Relatório Diário (Agendado)

1. **Criar novo Workflow**
   - Nome: "Relatório Diário de Vendas"

2. **Trigger: Schedule**
   - Procure por "Schedule"
   - Trigger type: "Every day"
   - Time: `08:00` (8 da manhã)

3. **Node: HTTP Request**
   - Procure por "HTTP Request"
   - Method: GET
   - URL: `http://localhost:3000/api/payments?status=COMPLETED`
   - Headers:
     - Authorization: `Bearer {{$env.BACKEND_API_TOKEN}}`

4. **Node: Set** (Formatar dados)
   - Procure por "Set"
   - Configure os campos que quer enviar

5. **Node: SendGrid - Email**
   - To Email: `admin@restaurante.com`
   - Subject: `Relatório de Vendas - {{$now}}`
   - Template: Use um template HTML bonito

6. **Salvar e Ativar**

---

## PASSO 5️⃣: Integrações Externas

### 5.1 - SendGrid (Email)

**Configuração:**

1. Crie uma conta em [sendgrid.com](https://sendgrid.com)
2. Gere uma API Key
3. Adicione no `.env`:
   ```env
   SENDGRID_API_KEY=SG.xxx...
   ```
4. Em n8n, ao usar SendGrid, autentique com essa chave

### 5.2 - Twilio (SMS)

**Configuração:**

1. Crie uma conta em [twilio.com](https://twilio.com)
2. Pegue seu Account SID, Auth Token e Phone Number
3. Adicione no `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxx...
   TWILIO_AUTH_TOKEN=xxx...
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### 5.3 - Google Sheets (Registrar Dados)

**Configuração:**

1. Crie uma planilha em [sheets.google.com](https://sheets.google.com)
2. Em n8n, clique em "Authenticate" no nó Google Sheets
3. Siga o fluxo OAuth do Google
4. Selecione a planilha e a aba

---

## TESTAR AUTOMAÇÕES ✅

### Teste 1: Novo Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "tableId": "table-1",
    "notes": "Teste de webhook"
  }'
```

**Verificar:**
- ✅ n8n recebeu o webhook (check no log)
- ✅ Email foi enviado para gerente
- ✅ SMS foi enviado para cozinha

### Teste 2: Confirmar Pagamento

```bash
curl -X POST http://localhost:3000/api/payments/1/confirm \
  -H "Authorization: Bearer <seu_token>"
```

**Verificar:**
- ✅ n8n recebeu o webhook
- ✅ Email de confirmação foi enviado

### Teste 3: Relatório Diário (Manual)

Em n8n:
- Clique no workflow "Relatório Diário"
- Clique em "Execute Workflow"
- Verifique se o email foi enviado

---

## 📊 Monitoramento em n8n

1. **Execuções**: Menu lateral > "Executions"
   - Veja todas as execuções de webhooks
   - Clique para ver detalhes

2. **Logs**: Cada nó tem um log
   - Veja inputs/outputs de cada nó
   - Útil para debug

3. **Alertas**: Configure notificações de falhas
   - Settings > Notifications
   - Receba email quando algo falhar

---

## 🎯 Checklist de Conclusão

- [ ] Arquivo `events.service.ts` criado e testado
- [ ] Arquivo `events.module.ts` criado
- [ ] `EventsService` importado em `orders.controller.ts`
- [ ] `EventsService` importado em `payments.controller.ts`
- [ ] Webhooks disparadores implementados
- [ ] n8n acessível em `http://localhost:5678`
- [ ] Conta criada e configurada em n8n
- [ ] `.env` atualizado com URLs de webhooks
- [ ] Workflow "Novo Pedido" criado e ativado
- [ ] Workflow "Pagamento Confirmado" criado e ativado
- [ ] SendGrid configurado (opcional)
- [ ] Twilio configurado (opcional)
- [ ] Teste 1: Novo Pedido funcionando
- [ ] Teste 2: Pagamento funcionando
- [ ] Teste 3: Relatório funcionando

---

## 🎉 Próxima Fase

Após completar Fase 5, você estará pronto para:

1. **Fase 6**: Dashboard Admin (gráficos, analytics, relatórios)
2. **Fase 7**: Frontend com Next.js (telas de pedidos, cardápio, checkout)

---

## 📚 Recursos Úteis

- [n8n Documentation](https://docs.n8n.io)
- [n8n Nodes Library](https://n8n.io/nodes)
- [SendGrid API Reference](https://docs.sendgrid.com)
- [Twilio API Reference](https://www.twilio.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)

