# ⚡ Quick Reference - Comandos Essenciais

## 🚀 Setup Inicial (Primeira Vez)

```bash
# 1. Navegar para o projeto
cd n8n-restaurant

# 2. Copiar configuração de ambiente
cp .env.example .env

# 3. Iniciar serviços Docker (aguarde 30s)
docker-compose up -d

# 4. Backend setup
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 5. Iniciar backend
npm run start:dev

# 6. Em outro terminal - Frontend (opcional)
cd apps/frontend
npm install
npm run dev
```

---

## 🎯 Desenvolvimento Diário

### Backend

```bash
cd apps/backend

# Dev com hot reload
npm run start:dev

# Build para produção
npm run build
npm run start:prod

# Testes
npm run test
npm run test:watch
npm run test:cov

# Lint e format
npm run lint
npm run format

# Prisma
npx prisma studio                    # UI visual (abrir browser)
npx prisma migrate dev --name nome   # Criar migração
npx prisma db seed                   # Re-seed dados
```

### Frontend

```bash
cd apps/frontend

# Dev
npm run dev

# Build
npm run build
npm run start

# Tests
npm run test
```

---

## 🐳 Docker

```bash
# (Executar da raiz do projeto)

# Iniciar tudo
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f              # Todos
docker-compose logs -f postgres     # Serviço específico

# Parar
docker-compose stop

# Parar e remover
docker-compose down

# Limpar volumes (cuidado - perde dados!)
docker-compose down -v

# Reiniciar um serviço
docker-compose restart postgres
```

---

## 🌐 URLs e Acessos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Backend** | http://localhost:3000 | - |
| **Swagger** | http://localhost:3000/api/docs | - |
| **Frontend** | http://localhost:3001 | - |
| **pgAdmin** | http://localhost:5050 | admin / admin |
| **n8n** | http://localhost:5678 | Setup na 1ª vez |
| **Mailhog** | http://localhost:8025 | - |
| **Redis** | localhost:6379 | redis_password |
| **PostgreSQL** | localhost:5432 | restaurant_user / restaurant_password |

---

## 🔓 Credenciais de Teste

### Usuários do Banco (após seed)

```
Email                      Senha     Papel
admin@restaurant.local     admin123  ADMIN
gerente@restaurant.local   admin123  MANAGER
garcom@restaurant.local    admin123  WAITER
cozinha@restaurant.local   admin123  KITCHEN
bar@restaurant.local       admin123  BAR
```

### pgAdmin

```
Email: admin@restaurant.local
Senha: admin
```

---

## 📝 Estrutura de Módulos

### Criar novo módulo

```bash
cd apps/backend/src/modules

# Template
mkdir novo-modulo
cd novo-modulo

# Criar arquivos base
cat > novo-modulo.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { NovoModuloController } from './novo-modulo.controller';
import { NovoModuloService } from './novo-modulo.service';

@Module({
  controllers: [NovoModuloController],
  providers: [NovoModuloService],
})
export class NovoModuloModule {}
EOF

# Depois criar:
# - novo-modulo.service.ts
# - novo-modulo.controller.ts
# - novo-modulo.service.spec.ts
# - dto/ (com DTOs)
# - entities/ (com entidades)
```

---

## 🧪 Testes Rápidos

### CURL (Terminal)

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.local","password":"admin123"}'

# Com token
TOKEN="seu_token_aqui"
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Insomnia/Postman

1. Importar URL: `http://localhost:3000/api/docs`
2. Vai popular automaticamente todos os endpoints

---

## 🔍 Troubleshooting Rápido

### Docker não inicia

```bash
# Verificar o que está usando portas
netstat -ano | findstr :5432      # PostgreSQL
netstat -ano | findstr :6379      # Redis
netstat -ano | findstr :5050      # pgAdmin

# Liberar porta (Windows)
taskkill /PID <PID> /F

# Liberar porta (Linux/Mac)
lsof -i :5432
kill -9 <PID>
```

### Banco vazio após migrações

```bash
cd apps/backend

# Limpar e re-criar
npx prisma migrate reset
npx prisma db seed
```

### Erro de módulo não encontrado

```bash
cd apps/backend
npm install
npx prisma generate
```

### Backend não conecta ao banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Reiniciar
docker-compose restart postgres

# Aguardar e tentar novamente
sleep 15
npm run start:dev
```

---

## 📊 Git Workflow

```bash
# Ver status
git status

# Adicionar arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: implementar auth service"

# Tipos de commit
feat:       Nova feature
fix:        Bug fix
docs:       Documentação
style:      Formatação
refactor:   Refatoração
test:       Testes
chore:      Dependências, etc

# Enviar
git push origin main
```

---

## 🎨 Padrões Rápidos

### Service

```typescript
@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateOrderDto) {
    // Validação
    // Lógica
    // Retorno
  }
}
```

### Controller

```typescript
@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }
}
```

### DTO

```typescript
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @IsArray()
  @ArrayMinSize(1)
  items: OrderItemDto[];
}
```

---

## 📚 Documentação Rápida

- **SETUP.md** - Como instalar (leitura obrigatória)
- **ARQUITETURA.md** - Design decisions
- **PADROES.md** - Código patterns
- **ROADMAP.md** - Phases e timeline
- **README.md** - Overview

---

## 💻 VS Code Extensions Recomendadas

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "prisma.prisma",
    "ms-rest-client.rest-client",
    "mongodb.mongodb-vscode",
    "nrwl.angular-console"
  ]
}
```

---

## 🔐 Variáveis de Ambiente Importantes

```env
# JWT (MUDAR EM PRODUÇÃO)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database
DATABASE_URL=postgresql://restaurant_user:restaurant_password@postgres:5432/restaurant_db

# API
API_PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

---

## 🎯 Checklist Antes de Commit

- [ ] Código compila (sem TypeScript errors)
- [ ] ESLint passa (npm run lint)
- [ ] Prettier formatou (npm run format)
- [ ] Testes passam (npm run test)
- [ ] Swagger updated (automático)
- [ ] Sem console.log
- [ ] DTOs com validações
- [ ] Mensagem de commit descritiva
- [ ] Sem código comentado
- [ ] Documentação atualizada

---

## 🆘 Help Commands

```bash
# Ver todos os scripts disponíveis
npm run

# Informações do projeto
npm list

# Verificar vulnerabilidades
npm audit

# Update safe
npm update

# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Contatos Rápidos

- **Docs**: `/docs` pasta
- **Issues**: GitHub Issues
- **Slack**: Time dev
- **Email**: gabriel@restaurant.local

---

**Última atualização**: 13 de Janeiro de 2024
**Versão**: 1.0.0
