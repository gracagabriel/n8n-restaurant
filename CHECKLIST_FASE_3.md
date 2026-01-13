# ✅ Checklist Fase 3 - Controllers de Domínio

Acompanhe seu progresso na **Fase 3: Controllers de Domínio**

---

## PASSO 1️⃣: Categories Service (10 minutos)

```
⏱️ Horário: ________

1.1 - Criar CategoriesService:
  [ ] Criou arquivo: src/modules/categories/categories.service.ts
  [ ] Implementou: create(), findAll(), findById(), update(), delete()
  [ ] Implementou: countItems()
  
1.2 - Criar CategoriesModule:
  [ ] Criou arquivo: src/modules/categories/categories.module.ts
  [ ] Importou DatabaseModule
  [ ] Exportou CategoriesService
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro
```

---

## PASSO 2️⃣: Categories Controller (10 minutos)

```
⏱️ Horário: ________

2.1 - Criar CategoriesController:
  [ ] Criou arquivo: src/modules/categories/categories.controller.ts
  [ ] Implementou POST /categories (protegido: ADMIN, MANAGER)
  [ ] Implementou GET /categories (público)
  [ ] Implementou GET /categories/:id (público)
  [ ] Implementou PUT /categories/:id (protegido: ADMIN, MANAGER)
  [ ] Implementou DELETE /categories/:id (protegido: ADMIN)
  
2.2 - Atualizar CategoriesModule:
  [ ] Adicionou CategoriesController aos controllers
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro
```

---

## PASSO 3️⃣: MenuItems Service (10 minutos)

```
⏱️ Horário: ________

3.1 - Criar MenuItemsService:
  [ ] Criou arquivo: src/modules/menu-items/menu-items.service.ts
  [ ] Implementou: create(), findAll(), findById(), update(), delete()
  [ ] Implementou: findByCategory()
  
3.2 - Criar MenuItemsModule:
  [ ] Criou arquivo: src/modules/menu-items/menu-items.module.ts
  [ ] Importou DatabaseModule
  [ ] Exportou MenuItemsService
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro
```

---

## PASSO 4️⃣: MenuItems Controller (10 minutos)

```
⏱️ Horário: ________

4.1 - Criar MenuItemsController:
  [ ] Criou arquivo: src/modules/menu-items/menu-items.controller.ts
  [ ] Implementou POST /menu-items (protegido: ADMIN, MANAGER)
  [ ] Implementou GET /menu-items (público, com filtro)
  [ ] Implementou GET /menu-items/:id (público)
  [ ] Implementou PUT /menu-items/:id (protegido: ADMIN, MANAGER)
  [ ] Implementou DELETE /menu-items/:id (protegido: ADMIN)
  [ ] Implementou GET /menu-items/category/:categoryId (público)
  
4.2 - Atualizar MenuItemsModule:
  [ ] Adicionou MenuItemsController aos controllers
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro
```

---

## PASSO 5️⃣: Tables Service (10 minutos)

```
⏱️ Horário: ________

5.1 - Criar TablesService:
  [ ] Criou arquivo: src/modules/tables/tables.service.ts
  [ ] Implementou: create(), findAll(), findById(), update(), delete()
  [ ] Implementou: markOccupied(), markAvailable()
  
5.2 - Criar TablesModule:
  [ ] Criou arquivo: src/modules/tables/tables.module.ts
  [ ] Importou DatabaseModule
  [ ] Exportou TablesService
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro
```

---

## PASSO 6️⃣: Tables Controller (10 minutos)

```
⏱️ Horário: ________

6.1 - Criar TablesController:
  [ ] Criou arquivo: src/modules/tables/tables.controller.ts
  [ ] Implementou POST /tables (protegido: ADMIN, MANAGER)
  [ ] Implementou GET /tables (público, com filtro por status)
  [ ] Implementou GET /tables/:id (público)
  [ ] Implementou PUT /tables/:id (protegido: ADMIN, MANAGER)
  [ ] Implementou DELETE /tables/:id (protegido: ADMIN)
  [ ] Implementou PUT /tables/:id/occupy (protegido: autenticado)
  [ ] Implementou PUT /tables/:id/release (protegido: autenticado)
  
6.2 - Atualizar TablesModule:
  [ ] Adicionou TablesController aos controllers
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro
```

---

## PASSO 7️⃣: Integração e Testes (30 minutos)

```
⏱️ Horário: ________

7.1 - Atualizar AppModule:
  [ ] Importou CategoriesModule
  [ ] Importou MenuItemsModule
  [ ] Importou TablesModule
  
7.2 - Compilar:
  [ ] Executou: npx tsc
  [ ] Resultado: ✅ Sem erros
  
7.3 - Iniciar servidor:
  [ ] Executou: node dist/main.js
  [ ] Servidor rodando em http://localhost:3000
  
7.4 - Testar Endpoints:
  [ ] POST /api/categories (criar) - 201
  [ ] GET /api/categories - 200
  [ ] GET /api/categories/:id - 200
  [ ] PUT /api/categories/:id - 200
  [ ] DELETE /api/categories/:id - 200
  
  [ ] POST /api/menu-items (criar) - 201
  [ ] GET /api/menu-items - 200
  [ ] GET /api/menu-items/:id - 200
  [ ] PUT /api/menu-items/:id - 200
  [ ] DELETE /api/menu-items/:id - 200
  
  [ ] POST /api/tables (criar) - 201
  [ ] GET /api/tables - 200
  [ ] GET /api/tables/:id - 200
  [ ] PUT /api/tables/:id - 200
  [ ] DELETE /api/tables/:id - 200
  [ ] PUT /api/tables/:id/occupy - 200
  [ ] PUT /api/tables/:id/release - 200
  
7.5 - Testar Autenticação:
  [ ] POST sem token retorna 401
  [ ] POST com token inválido retorna 401
  [ ] POST com token válido retorna 201
  
7.6 - Testar Autorização:
  [ ] CUSTOMER não consegue criar categoria (403)
  [ ] WAITER não consegue deletar mesa (403)
  [ ] ADMIN consegue fazer todas as operações (200/201)
  
Status: [ ] ✅ Completo | [ ] ⏳ Em progresso | [ ] ❌ Erro

Problemas encontrados:
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ VERIFICAÇÃO FINAL FASE 3

```
CONTROLLERS:
  [ ] CategoriesController criado e funcionando
  [ ] MenuItemsController criado e funcionando
  [ ] TablesController criado e funcionando

SERVIÇOS:
  [ ] CategoriesService criado e funcionando
  [ ] MenuItemsService criado e funcionando
  [ ] TablesService criado e funcionando

ENDPOINTS:
  [ ] 5 endpoints de categories funcionando
  [ ] 6 endpoints de menu-items funcionando
  [ ] 7 endpoints de tables funcionando

AUTENTICAÇÃO:
  [ ] JwtAuthGuard protegendo rotas POST, PUT, DELETE
  [ ] RoleGuard validando roles corretamente
  [ ] Endpoints públicos acessíveis sem token

TESTES:
  [ ] Criar categoria: ✅
  [ ] Listar categorias: ✅
  [ ] Atualizar categoria: ✅
  [ ] Deletar categoria: ✅
  
  [ ] Criar item: ✅
  [ ] Listar itens: ✅
  [ ] Filtrar por categoria: ✅
  [ ] Atualizar item: ✅
  [ ] Deletar item: ✅
  
  [ ] Criar mesa: ✅
  [ ] Listar mesas: ✅
  [ ] Filtrar por status: ✅
  [ ] Ocupar mesa: ✅
  [ ] Liberar mesa: ✅
  [ ] Atualizar mesa: ✅
  [ ] Deletar mesa: ✅

RESULTADO FINAL:
  
  [ ] ✅ DOMÍNIOS COMPLETOS! Pronto para Fase 4!
  
  [ ] ⚠️ PARCIAL - Alguns problemas:
      ___________________________________
      
  [ ] ❌ NÃO FUNCIONOU - Erro crítico:
      ___________________________________
```

---

## 📊 Tempo Total

```
Passo 1 (Categories Service):      10 min
Passo 2 (Categories Controller):   10 min
Passo 3 (MenuItems Service):       10 min
Passo 4 (MenuItems Controller):    10 min
Passo 5 (Tables Service):          10 min
Passo 6 (Tables Controller):       10 min
Passo 7 (Testes):                  30 min

TEMPO TOTAL:                       ~90 minutos (1,5 horas)

Seu tempo real: _____ minutos
```

---

## 🎯 Próximo: Fase 4

Quando marcar ✅ na "VERIFICAÇÃO FINAL FASE 3", você está pronto para:

### Fase 4: Pedidos e Pagamentos
- OrdersService e OrdersController (CRUD)
- OrderItemsService (itens do pedido)
- PaymentsService (processar pagamentos)
- Webhooks para notificações
- Integração com n8n

**Tempo estimado:** 6-8 horas

---

**Desenvolvido com ❤️ para seu sucesso**
