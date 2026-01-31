# 🚀 Construir Workflow "Novo Pedido - Notificações" em n8n

**Email para Testes**: gabrielgraca@outlook.com.br  
**Data**: 31 de Janeiro de 2026  
**Status**: 🟢 Pronto para construção

---

## 📋 O que vamos construir

Um workflow que:
1. ✅ Recebe webhook quando um novo pedido é criado
2. ✅ Valida se o pedido tem dados
3. ✅ Envia email para gerente (você)
4. ✅ Envia SMS para cozinha (número de teste)
5. ✅ Log de sucesso

**Fluxo**:
```
Webhook (Backend) 
    ↓
Filter (Validar)
    ↓
Set (Formatar)
    ↓
SendGrid (Email) + Twilio (SMS)
    ↓
Success
```

---

## 🛠️ PASSO 1: Abrir Workflow Existente

1. Acesse n8n: **http://localhost:5678**
2. No painel à esquerda, clique em **Workflows**
3. Clique no workflow **"Novo Pedido - Notificações"** que você criou
4. Você verá o **Webhook node** já configurado

---

## 🛠️ PASSO 2: Adicionar Node "Filter"

O Filter vai verificar se os dados são válidos.

### 2.1 - Criar o Node
1. Clique no **"+"** depois do Webhook node
2. Procure por **"Filter"**
3. Selecione **"Filter"** (o simples)

### 2.2 - Configurar Filter
Na caixa que aparecer, configure:

**Condition:**
```
json.body.data.orderId is set
```

Isso garante que o orderId existe no webhook.

**Click "Add condition" e adicione:**
```
json.body.data.orderNumber is set
```

Pronto! O Filter vai deixar passar apenas webhooks com dados válidos.

---

## 🛠️ PASSO 3: Adicionar Node "Set"

O Set vai formatar os dados para facilitar usar nos próximos nós.

### 3.1 - Criar o Node
1. Clique no **"+"** depois do Filter
2. Procure por **"Set"**
3. Selecione **"Set"** (o simples)

### 3.2 - Configurar Set
Na aba **"Data to Set"**, você vai criar variáveis. Clique em **"Add..."** para cada linha:

**Linha 1:**
```
Name: orderId
Value: {{ $node["Webhook"].json.body.data.orderId }}
```

**Linha 2:**
```
Name: orderNumber
Value: {{ $node["Webhook"].json.body.data.orderNumber }}
```

**Linha 3:**
```
Name: tableId
Value: {{ $node["Webhook"].json.body.data.tableId }}
```

**Linha 4:**
```
Name: totalItems
Value: {{ $node["Webhook"].json.body.data.totalItems }}
```

**Linha 5:**
```
Name: totalAmount
Value: {{ $node["Webhook"].json.body.data.totalAmount }}
```

**Linha 6:**
```
Name: timestamp
Value: {{ $node["Webhook"].json.body.timestamp }}
```

Pronto! Agora temos variáveis formatadas e fáceis de usar.

---

## 📧 PASSO 4: Adicionar Node "SendGrid - Email"

Este node vai enviar um email para você (gerente) notificando sobre o novo pedido.

### 4.1 - Criar o Node
1. Clique no **"+"** depois do Set
2. Procure por **"SendGrid"**
3. Selecione **"Send Email"** (SendGrid)

### 4.2 - Autenticar SendGrid
1. Na seção **"Authentication"**, clique em **"Create new credential"**
2. Nome: **"SendGrid API"**
3. Cole a chave: YOUR_SENDGRID_API_KEY
4. Clique em **"Create"**

### 4.3 - Configurar Campos do Email

**From Email:**
```
noreply@restaurant.com
```

**To Email:**
```
gabrielgraca@outlook.com.br
```

**Subject:**
```
🚨 Novo Pedido Recebido! #{{ $node["Set"].json.orderNumber }}
```

**Message:**
```
Olá Gerente! 👋

Um novo pedido foi registrado no sistema!

📋 Detalhes do Pedido:
- ID do Pedido: {{ $node["Set"].json.orderId }}
- Número: {{ $node["Set"].json.orderNumber }}
- Mesa: {{ $node["Set"].json.tableId }}
- Total de Itens: {{ $node["Set"].json.totalItems }}
- Valor Total: R$ {{ $node["Set"].json.totalAmount }}
- Horário: {{ $node["Set"].json.timestamp }}

👨‍🍳 Verifique o sistema para mais detalhes!

---
Sistema de Gestão de Restaurante
```

Pronto! O email está configurado.

---

## 📱 PASSO 5: Adicionar Node "Twilio - SMS"

Este node vai enviar um SMS para a cozinha.

### 5.1 - Criar o Node
1. Clique no **"+"** depois do SendGrid (importante: clique no **"+"** que sai de SET, não de SendGrid)
2. Procure por **"Twilio"**
3. Selecione **"Send SMS"** (Twilio)

### 5.2 - Autenticar Twilio
1. Na seção **"Authentication"**, clique em **"Create new credential"**
2. Nome: **"Twilio SMS"**
3. **Account SID**: YOUR_TWILIO_ACCOUNT_SID
4. **Auth Token**: YOUR_TWILIO_ACCOUNT_TOKEN
5. Clique em **"Create"**

### 5.3 - Configurar SMS

**From:**
```
+19126424714
```

**To:**
```
+19126424714
```
(Isso é o número de teste do Twilio - SMS vai voltar para você mesmo)

**Message:**
```
🍽️ NOVO PEDIDO RECEBIDO!
Pedido #{{ $node["Set"].json.orderNumber }}
Mesa: {{ $node["Set"].json.tableId }}
Itens: {{ $node["Set"].json.totalItems }}
```

Pronto! SMS configurado.

---

## ✅ PASSO 6: Testar o Workflow

### 6.1 - Salvar
Clique em **"Save"** no topo direito.

### 6.2 - Executar Teste
1. Clique em **"Test"** (botão no topo)
2. Você verá o webhook sendo executado
3. Se tudo ficar verde ✅, está funcionando!

### 6.3 - Verificar Execução
1. Na tela de teste, você deve ver:
   - ✅ Webhook (verde)
   - ✅ Filter (verde)
   - ✅ Set (verde)
   - ✅ SendGrid (verde)
   - ✅ Twilio (verde)

Se algum ficar vermelho ❌, clique nele para ver o erro.

---

## 🟢 PASSO 7: Ativar para Produção

Quando tudo estiver testado e funcionando:

1. Clique em **"Activate"** (botão no topo direito)
2. O workflow agora está **ativo** e pronto!
3. Qualquer novo pedido criado no backend vai:
   - ✅ Disparar o webhook
   - ✅ Validar os dados
   - ✅ Enviar email para você
   - ✅ Enviar SMS

---

## 🧪 PASSO 8: Testar com Pedido Real

Volta ao Postman e cria um novo pedido:

```
POST http://localhost:3000/api/orders
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  "tableId": "cml2lasbw000xyu1u07c06750",
  "notes": "Teste com SendGrid e Twilio"
}
```

**Aguarde 10 segundos** e verifique:
1. ✅ Você recebeu um email em `xxx@outlook.com.br`
2. ✅ Você recebeu um SMS (volta para o número +19126424714)
3. ✅ Em n8n > Executions, você vê a execução registrada

---

## 📊 Monitoramento

Após ativar o workflow:

1. **Ir para Executions** (menu lateral)
2. Ver todas as execuções
3. Clicar em qualquer uma para ver detalhes
4. Verificar inputs/outputs de cada nó

---

## 🎯 Próximos Workflows (Após Este Estar Funcionando)

1. **"Pagamento Confirmado"** - Similar a este
2. **"Pedido Cancelado"** - Com nó Twilio
3. **"Relatório Diário"** - Com Schedule trigger

---

## ⚠️ Dicas Importantes

1. **Email da SendGrid**: Se não receber, cheque a pasta de spam
2. **SMS do Twilio**: Em conta de teste, volta para o mesmo número
3. **Variáveis com {{ }}**: Sempre use essas sintaxe para dinâmico
4. **Teste primeiro**: Sempre teste antes de ativar para produção

---

## 📝 Checklist

- [ ] Node Filter adicionado e configurado
- [ ] Node Set adicionado com 6 variáveis
- [ ] Node SendGrid adicionado e autenticado
- [ ] Node Twilio adicionado e autenticado
- [ ] Workflow testado (todos nós verdes)
- [ ] Email de teste recebido em xxx@outlook.com.br
- [ ] SMS de teste recebido
- [ ] Workflow ativado para produção
- [ ] Novo pedido criado via Postman
- [ ] Email e SMS recebidos com novo pedido

---

**Avança com a construção e me avisa quando tiver pronto! Se algo não funcionar, me manda screenshot da tela!** 🚀
