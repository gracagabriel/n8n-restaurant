# ✅ Checklist de Setup - Acompanhe Seu Progresso

## 📍 COMECE AQUI!

Use este arquivo para marcar seu progresso enquanto executa o **GUIA_SETUP_PASSO_A_PASSO.md**

---

## PASSO 1️⃣: Pré-requisitos (5 minutos)

```
⏱️ Horário: ________

Verificações:
  [ X ] Node.js v18+ instalado        (node --version)
  [ X ] npm v9+ instalado             (npm --version)
  [ X ] Docker instalado              (docker --version)
  [ X ] Docker Compose v2+ instalado  (docker-compose --version)
  [ X ] Git instalado                 (git --version)
  
Resultado: [ X ] ✅ PASSOU | [ ] ❌ FALHOU
```

---

## PASSO 2️⃣: Arquivo de Configuração (2 minutos)

```
⏱️ Horário: ________

Ações:
  [ X ] Entrou na pasta n8n-restaurant
  [ X ] Criou arquivo .env (cp .env.example .env)
  [ X ] Verificou que .env foi criado (ls .env)

Arquivo .env criado:
  [ X ] Sim - Continue
  [ ] Não - Verifique permissões
```

---

## PASSO 3️⃣: Docker Compose (15 minutos)

```
⏱️ Horário de início: ________
⏱️ Horário de término: ________

Ação:
  [ X ] Executou: docker-compose up -d

Verificação - docker-compose ps:
  [ X ] restaurant_postgres    Up (healthy)
  [ X ] restaurant_redis       Up (healthy)
  [ X ] restaurant_pgadmin     Up (healthy)
  [ X ] restaurant_n8n         Up (healthy)
  [ X ] restaurant_mailhog     Up (healthy)

Status:
  [ X ] ✅ Todos "healthy"
  [ ] ⏳ Aguardando (espere 30-60 segundos)
  [ ] ❌ Algum não está healthy - ver logs

Se houver problema:
  [X] RESOLVIDO: docker-compose.yml atualizado
      - Removida linha `version` obsoleta
      - pgAdmin email alterado para admin@example.com
      - Containers reiniciados com sucesso
```

---

## PASSO 4️⃣: Setup Backend (20 minutos)

```
⏱️ Horário de início: ________
⏱️ Horário de término: ________

Navegação:
  [ X ] Entrou em: cd apps/backend

4.2 - Instalar dependências:
  [ X ] Executou: npm install
  [ X ] Resultado: ✅ added 800+ packages

4.3 - Gerar tipos Prisma:
  [ X ] Executou: npx prisma generate
  [ ] Resultado: ✅ Generated Prisma Client

4.4 - Rodar migrações:
  [ X ] Executou: npx prisma migrate dev --name init
  [ X ] Respondeu: y (sim)
  [ X ] Resultado: ✅ Database in sync

4.5 - Seed dados:
  [ X ] Executou: npx prisma db seed
  [ X ] Resultado: ✅ Seed concluído com sucesso!
  
Status final:
  [ X ] ✅ Tudo passou
  [ ] ❌ Alguma falha - qual? ___________
```

---

## PASSO 5️⃣: Iniciar Backend (5 minutos)

```
⏱️ Horário: ________

Ação:
  [ X ] Executou: npx tsc && node dist/main.js

Esperado na saída:
  [ X ] 🚀 Restaurant Management API iniciada com sucesso!
  [ X ] 📍 Endpoint:   http://localhost:3000
  [ X ] 📚 Swagger:    http://localhost:3000/api/docs
  [ X ] 🔐 JWT Auth:   Ativada
  
Mensagens de erro:
  [ X ] Nenhuma
  [ ] Algumas (qual?) ___________________

Status:
  [ X ] ✅ Backend rodando e respondendo
  [ ] ⏳ Ainda inicializando (espere)
  [ ] ❌ Erro - verifique acima
```

---

## PASSO 6️⃣: Testar Endpoints (5 minutos)

**Abra UM NOVO TERMINAL enquanto mantém backend rodando**

```
⏱️ Horário: ________

6.1 - Health Check:
  [ X ] Executou: Invoke-WebRequest http://localhost:3000/api/health
  [ X ] Resultado recebido:
      {
        "status": "ok",
        "database": "connected",
        "timestamp": "2026-01-13T19:23:02.000Z"
      }
  
  Resultado: [ X ] ✅ OK | [ ] ❌ Erro

6.2 - Login (esperado falhar, é Fase 2):
  [ X ] Tentou fazer login (pode falhar)
  [ X ] Resultado esperado: "Cannot POST /api/auth/login" (OK!)

6.3 - Swagger Visual:
  [ X ] Abriu: http://localhost:3000/api/docs
  [ X ] Página azul apareceu: [ X ] Sim | [ ] Não
```

---

## PASSO 7️⃣: Ferramentas Administrativas (5 minutos)

```
⏱️ Horário: ________

pgAdmin (Gerenciar Banco):
  [ X ] Abriu: http://localhost:5050/pgadmin
  [ X ] Login: admin@restaurant.local / admin
  [ X ] Conectou ao PostgreSQL
  [ X ] Conseguiu ver as tabelas
  
n8n (Automações):
  [ X ] Abriu: http://localhost:5678
  [ X ] Fez setup inicial
  [ X ] Acessível (pode usar depois)

Mailhog (Teste de Emails):
  [ X ] Abriu: http://localhost:8025
  [ X ] Página carregou
```

---

## ✅ VERIFICAÇÃO FINAL

```
DOCKER:
  [X] Todos os 5 containers "healthy"
  [X] Nenhum erro nos logs
  [X] Podem ser acessados via HTTP

BACKEND:
  [X] npm install completou
  [X] Prisma setup completou
  [X] Seed inseriu dados
  [X] Backend rodando em http://localhost:3000
  [X] Health check retorna "ok"

BANCO:
  [X] 10 tabelas criadas
  [X] 5 usuários de teste
  [X] Cardápio com 5 categorias
  [X] 11 itens de menu
  [X] 5 mesas
  [X] 1 pedido de exemplo

DOCUMENTAÇÃO:
  [X] Acessível em http://localhost:3000/api/docs
  [X] Endpoints aparecem
  [X] Pode interagir com API

RESULTADO FINAL:
  
  [X] ✅ TUDO FUNCIONANDO! Pronto para Fase 2!
  
  [ ] ⚠️ PARCIAL - Alguns problemas:
      ___________________________________
      
  [ ] ❌ NÃO FUNCIONOU - Erro crítico:
      ___________________________________
```

---

## 📊 Tempo Total

```
Passo 1 (Pré-requisitos):       5 min
Passo 2 (.env):                 2 min
Passo 3 (Docker):              15 min
Passo 4 (Backend setup):       20 min
Passo 5 (Start backend):        5 min
Passo 6 (Testes):              5 min
Passo 7 (Ferramentas admin):   5 min

TEMPO TOTAL:                   ~57 minutos

Seu tempo real: _____ minutos
```

---

## 📝 Anotações Importantes

```
Problemas encontrados:
_________________________________________________________________
_________________________________________________________________

Soluções aplicadas:
_________________________________________________________________
_________________________________________________________________

Observações:
_________________________________________________________________
_________________________________________________________________

Próximos passos:
[ ] Ler docs/ARQUITETURA.md
[ ] Ler docs/PADROES.md
[ ] Começar Fase 2 - Implementar Auth
```

---

## 🎯 Próximo: Guia Prático Fase 2

Quando marcar ✅ na "VERIFICAÇÃO FINAL", você está pronto para:

### Fase 2: Implementar Autenticação

**Próximos arquivos a ler:**
1. [docs/ARQUITETURA.md](docs/ARQUITETURA.md) - 30 min
2. [docs/PADROES.md](docs/PADROES.md) - 60 min
3. Começar implementação do AuthService

**Será criado:**
- AuthService (login, register, JWT)
- AuthController (endpoints)
- JWT Guard (proteção de rotas)
- Testes automatizados
- Documentação atualizada

**Tempo estimado:** 8 horas

---

## 🆘 Se Algo Não Funcionar

**Antes de desistir, tente:**

1. Ler a seção "Troubleshooting Rápido" em [GUIA_SETUP_PASSO_A_PASSO.md](GUIA_SETUP_PASSO_A_PASSO.md)

2. Verificar [QUICK_REFERENCE.md](QUICK_REFERENCE.md) para comandos

3. Ver [docs/SETUP.md](docs/SETUP.md) para troubleshooting detalhado

4. Checar logs:
   ```bash
   docker-compose logs -f postgres
   docker-compose logs -f redis
   npm run start:dev
   ```

---

## 📞 Checklist Preenchido?

Quando todos os checkboxes acima estiverem ✅, você completou a **Fase 1** com sucesso!

**Data de conclusão**: 13 de Janeiro de 2026

---

**🎉 Parabéns! Você tem um sistema de restaurante rodando!**

Agora é só melhorar e adicionar features na Fase 2.

*Desenvolvido com ❤️ para seu sucesso*
