# ✅ Checklist Fase 5 - Testes de Webhooks e n8n

**Data de Início**: 31 de Janeiro de 2026  
**Status**: 🟢 Em Progresso

---

## 📋 Informações Salvas para Testes

### Usuário de Teste
```
Email: admin@restaurant.com
Senha: admin123
Hash Bcrypt: $2b$10$lQxancfdOSNoitW685A81eH6htALDly21JD1W6/pItN2ZNnHXyPTi
```

### Credenciais de Autenticação (Session 31/01/2026)
```
User ID: cml2las870000yu1uut864fgy
Email: admin@restaurant.com
Role: ADMIN
```

### Tokens JWT (Válidos até próxima regeneração)
```
Access Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWwybGFzODcwMDAweXUxdXV0ODY0Zmd5IiwiZW1haWwiOiJhZG1pbkByZXN0YXVyYW50LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2OTg4MDc2MywiZXhwIjoxNzY5ODgxNjYzfQ.MgNAi6lObHnf3JcWM37QGaa_fVyDmpixLprdUSmSfdU

Refresh Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWwybGFzODcwMDAweXUxdXV0ODY0Zmd5IiwiZW1haWwiOiJhZG1pbkByZXN0YXVyYW50LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2OTg4MDc2MywiZXhwIjoxNzcwNDg1NTYzfQ.bWC08kZhGf5bJbBtqBdUCz0GJ3A-SNY0LeihChAHbwY
```

### Requisição Postman Salva - Login
```
Endpoint: POST http://localhost:3000/api/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}

Status: ✅ 200 OK
```

---

## 🧪 Testes Planejados

### Teste 1: Autenticação ✅ CONCLUÍDO
- [x] Fazer login com admin@restaurant.com
- [x] Receber accessToken e refreshToken válidos
- [x] Verificar dados do usuário retornados

**Resultado**: ✅ Sucesso - Backend respondendo corretamente

---

### Teste 2: Listar Mesas (GET /api/tables)
- [x] Usar accessToken obtido no Teste 1
- [x] Listar todas as mesas disponíveis
- [x] Copiar ID da primeira mesa para usar no Teste 3

**Resultado**: ✅ Sucesso - 5 mesas listadas

**Mesa Selecionada**: cml2lasbw000xyu1u07c06750 (Mesa 2 - Salão)

---

### Teste 3: Criar Novo Pedido (POST /api/orders)
- [x] Usar tableId obtido no Teste 2
- [x] Disparar webhook para n8n
- [x] Verificar se n8n recebeu o evento

**Resultado**: ✅ Sucesso - Webhook recebido em n8n

**Pedido Criado**: 
- Order ID: cml2lo4li0003jd355ugncz51
- Order Number: ORD-1769881369156-114
- Status: PENDING

**Webhook Details**:
- URL: http://localhost:5678/webhook-test/order-created
- Status: ✅ Green (Ativo)
- Tempo de Resposta: 6.945s
- Dados Recebidos: Completos (event, timestamp, data)

---

### Teste 4: Confirmar Status do Pedido (PATCH /api/orders/:id/status)
- [ ] Atualizar status para CONFIRMED
- [ ] Disparar webhook orderStatusUpdated
- [ ] Verificar se n8n recebeu o evento

**Comando Postman**:
```
PATCH http://localhost:3000/api/orders/<order_id>/status
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  "status": "CONFIRMED"
}
```

---

### Teste 5: Criar Pagamento (POST /api/payments)
- [ ] Usar orderId do Teste 3
- [ ] Disparar webhook paymentCreated
- [ ] Verificar se n8n recebeu o evento

**Comando Postman**:
```
POST http://localhost:3000/api/payments
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  "orderId": "<copiar_de_teste_3>",
  "amount": 50.00,
  "method": "CREDIT_CARD"
}
```

---

### Teste 6: Confirmar Pagamento (POST /api/payments/:id/confirm)
- [ ] Confirmar o pagamento criado
- [ ] Disparar webhook paymentConfirmed
- [ ] Verificar se n8n recebeu o evento

**Comando Postman**:
```
POST http://localhost:3000/api/payments/<payment_id>/confirm
Authorization: Bearer <accessToken>
```

---

### Teste 7: Criar Workflow em n8n
- [ ] Acessar http://localhost:5678
- [ ] Criar workflow "Novo Pedido - Notificações"
- [ ] Configurar trigger webhook
- [ ] Ativar workflow
- [ ] Copiar URL do webhook do n8n

**URL Webhook n8n**: 
```
(será preenchido após criação)
```

---

### Teste 8: Integrar Webhook no .env
- [ ] Copiar URL do webhook do n8n
- [ ] Adicionar em .env: WEBHOOK_ORDER_CREATED=<URL>
- [ ] Reiniciar backend
- [ ] Testar criação de pedido novamente

---

### Teste 9: Verificar Entrega de Webhook
- [ ] Executar Teste 3 novamente (Criar Pedido)
- [ ] Ir para n8n > Executions
- [ ] Verificar se execução foi registrada
- [ ] Analisar input/output do webhook

---

## 📊 Status Geral

| Fase | Tarefa | Status | Data |
|------|--------|--------|------|
| 5.0 | Backend online com EventsModule | ✅ | 31/01 |
| 5.1 | EventsService criado | ✅ | 31/01 |
| 5.2 | Webhooks integrados em controllers | ✅ | 31/01 |
| 5.3 | Banco de dados seeded | ✅ | 31/01 |
| 5.4 | Login testado | ✅ | 31/01 |
| 5.5 | Listar mesas | ⏳ | Próximo |
| 5.6 | Criar pedido | ⏳ | Próximo |
| 5.7 | Webhook n8n criado | ⏳ | Próximo |
| 5.8 | End-to-end completo | ⏳ | Próximo |

---

## 📝 Notas Importantes

1. **Hash Bcrypt Válido**: $2b$10$lQxancfdOSNoitW685A81eH6htALDly21JD1W6/pItN2ZNnHXyPTi
   - Gerado em 31/01/2026
   - Funciona corretamente para todos os usuários do seed

2. **Backend URL**: http://localhost:3000
   - Rodando em modo desenvolvimento
   - Watch mode ativo (recompila automaticamente)

3. **n8n URL**: http://localhost:5678
   - Rodando em Docker Compose
   - Pronto para criar workflows

4. **Banco de Dados**: PostgreSQL em Docker
   - Tabelas criadas via Prisma
   - Seed executado com sucesso
   - Pronto para testes

---

## 🔐 Segurança

⚠️ **IMPORTANTE**: Os tokens JWT acima expiram em 1 hora (accessToken) e 7 dias (refreshToken).

Se os tokens expirarem, execute novamente o Teste 1 (Login) para obter novos tokens.

---

## 🚀 Próximos Passos

1. ✅ Teste 1: Login - **CONCLUÍDO**
2. 🔄 Teste 2: Listar mesas
3. 🔄 Teste 3: Criar pedido
4. 🔄 Teste 4-6: Atualizar status e pagamentos
5. 🔄 Teste 7-9: Integração com n8n

---

**Última atualização**: 31 de Janeiro de 2026, 17:32 UTC
