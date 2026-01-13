# 🔐 Fase 2: Implementação de Autenticação - Guia Prático Passo a Passo

> **Pré-requisito**: Você completou a Fase 1 (Setup Inicial) com sucesso ✅

**Tempo estimado**: 8-10 horas  
**Resultado final**: API com autenticação JWT, login/registro, e proteção de rotas

---

## 📋 Índice

1. [Passo 1: UserService](#passo-1-userservice)
2. [Passo 2: AuthService](#passo-2-authservice)
3. [Passo 3: JWT Strategy](#passo-3-jwt-strategy)
4. [Passo 4: JWT Guard](#passo-4-jwt-guard)
5. [Passo 5: AuthController](#passo-5-authcontroller)
6. [Passo 6: Role Guard](#passo-6-role-guard)
7. [Passo 7: Testar Endpoints](#passo-7-testar-endpoints)

---

## PASSO 1️⃣: UserService

Vamos criar o serviço de usuários que será usado pela autenticação.

### 1.1 - Criar arquivo `users.service.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\users
```

Crie o arquivo `users.service.ts`:

```typescript
// ==========================================
// Users Service
// ==========================================

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encontrar usuário por email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Encontrar usuário por ID
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Criar novo usuário (com senha hasheada)
   */
  async create(email: string, name: string, password: string) {
    // Verificar se email já existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER', // Role padrão
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Validar senha
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Listar usuários (paginado)
   */
  async findAll(skip: number = 0, take: number = 10) {
    return this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Atualizar usuário
   */
  async update(id: string, data: { name?: string; email?: string; role?: string }) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Deletar usuário
   */
  async delete(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
```

### 1.2 - Criar arquivo `users.module.ts`

```typescript
// ==========================================
// Users Module
// ==========================================

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // Exportar para usar em outros módulos
})
export class UsersModule {}
```

### 1.3 - Atualizar `app.module.ts`

Adicione `UsersModule` às importações:

```typescript
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // ... configurações existentes
    DatabaseModule,
    UsersModule, // ← Adicionar aqui
  ],
  // ...
})
export class AppModule {}
```

---

## PASSO 2️⃣: AuthService

Serviço que gerencia login, registro e geração de tokens JWT.

### 2.1 - Criar arquivo `auth.service.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\auth
```

Crie `auth.service.ts`:

```typescript
// ==========================================
// Auth Service
// ==========================================

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registrar novo usuário
   */
  async register(email: string, name: string, password: string) {
    // Validações básicas
    if (!email || !name || !password) {
      throw new BadRequestException('Email, nome e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }

    // Criar usuário
    const user = await this.usersService.create(email, name, password);

    // Gerar tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login de usuário
   */
  async login(email: string, password: string) {
    // Validações
    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatórios');
    }

    // Encontrar usuário
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Validar senha
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Gerar tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Retornar sem a senha
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Gerar access token e refresh token
   */
  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // 15 minutos
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 dias
    });

    return { accessToken, refreshToken };
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
        { expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  /**
   * Validar token JWT (usado pelo JwtStrategy)
   */
  async validateJwtPayload(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}
```

### 2.2 - Criar arquivo `auth.module.ts`

```typescript
// ==========================================
// Auth Module
// ==========================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService],
  exports: [AuthService], // Para usar em outros módulos
})
export class AuthModule {}
```

---

## PASSO 3️⃣: JWT Strategy

Estratégia Passport para validar tokens JWT.

### 3.1 - Criar arquivo `jwt.strategy.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\auth
```

Crie `jwt.strategy.ts`:

```typescript
// ==========================================
// JWT Strategy (Passport)
// ==========================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    return this.authService.validateJwtPayload(payload);
  }
}
```

### 3.2 - Instalar passport-jwt

Execute no terminal:

```bash
cd apps\backend
npm install @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
```

### 3.3 - Adicionar JwtStrategy ao AuthModule

Atualize `auth.module.ts`:

```typescript
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy], // ← Adicionar JwtStrategy
  exports: [AuthService],
})
export class AuthModule {}
```

---

## PASSO 4️⃣: JWT Guard

Guard para proteger rotas que precisam de autenticação.

### 4.1 - Criar arquivo `jwt.guard.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\common
```

Crie `jwt.guard.ts`:

```typescript
// ==========================================
// JWT Auth Guard
// ==========================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 4.2 - Criar arquivo `index.ts` em common/

Se não existir, crie `common/index.ts`:

```typescript
export * from './jwt.guard';
```

---

## PASSO 5️⃣: AuthController

Controller com endpoints de login e registro.

### 5.1 - Criar arquivo `auth.controller.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\modules\auth
```

Crie `auth.controller.ts`:

```typescript
// ==========================================
// Auth Controller
// ==========================================

import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/jwt.guard';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registrar novo usuário
   * POST /api/auth/register
   */
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(
    @Body() body: { email: string; name: string; password: string },
  ) {
    return this.authService.register(body.email, body.name, body.password);
  }

  /**
   * Login de usuário
   * POST /api/auth/login
   */
  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  /**
   * Renovar access token
   * POST /api/auth/refresh
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token com refresh token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  /**
   * Obter dados do usuário logado
   * GET /api/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Post('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  async getMe(@Req() req: any) {
    return {
      user: req.user,
    };
  }
}
```

### 5.2 - Adicionar AuthController ao AuthModule

Atualize `auth.module.ts`:

```typescript
import { AuthController } from './auth.controller';

@Module({
  imports: [
    // ... importações
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController], // ← Adicionar controller
  exports: [AuthService],
})
export class AuthModule {}
```

### 5.3 - Importar AuthModule no AppModule

Atualize `app.module.ts`:

```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule, // ← Adicionar aqui
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

---

## PASSO 6️⃣: Role Guard (Controle de Acesso)

Guard para proteger rotas por role/permissão.

### 6.1 - Criar arquivo `role.guard.ts`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\common
```

Crie `role.guard.ts`:

```typescript
// ==========================================
// Role Guard (RBAC - Role Based Access Control)
// ==========================================

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Sem restrição de role, permite acesso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado: permissão insuficiente');
    }

    return true;
  }
}
```

### 6.2 - Criar decorator `@Roles()`

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend\src\common
```

Crie `roles.decorator.ts`:

```typescript
// ==========================================
// Roles Decorator
// ==========================================

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### 6.3 - Atualizar `common/index.ts`

```typescript
export * from './jwt.guard';
export * from './role.guard';
export * from './roles.decorator';
```

---

## PASSO 7️⃣: Testar Endpoints

Agora vamos testar a autenticação!

### 7.1 - Compilar TypeScript

```bash
cd C:\Users\Gabriel\Desktop\Projetos\React\n8n-restaurant\apps\backend
npm run build
```

Ou manualmente:

```bash
npx tsc
```

### 7.2 - Iniciar o servidor

```bash
node dist/main.js
```

Ou com watch mode:

```bash
npm run start:dev
```

### 7.3 - Testar Endpoints

Use o **Swagger** em http://localhost:3000/api/docs ou o PowerShell:

#### **Teste 1: Registrar novo usuário**

```powershell
$body = @{
    email = "cliente@restaurant.local"
    name = "João Cliente"
    password = "senha123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Resposta esperada:**
```json
{
  "user": {
    "id": "uuid",
    "email": "cliente@restaurant.local",
    "name": "João Cliente",
    "role": "USER",
    "createdAt": "2026-01-13T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Teste 2: Login**

```powershell
$body = @{
    email = "cliente@restaurant.local"
    password = "senha123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

#### **Teste 3: Obter dados do usuário logado**

```powershell
$accessToken = "COLE_O_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $accessToken"
}

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/me" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json"

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

#### **Teste 4: Renovar token**

```powershell
$body = @{
    refreshToken = "COLE_O_REFRESH_TOKEN_AQUI"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/refresh" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

## ✅ Checklist Fase 2

Use o arquivo `CHECKLIST_FASE_2.md` para acompanhar seu progresso!

---

## 📝 Próximos Passos

Após completar Fase 2, você pode:

1. **Fase 3**: Criar Controllers para Categorias, Cardápio, Mesas
2. **Fase 4**: Implementar Pedidos e Pagamentos
3. **Fase 5**: Integração com n8n para automações
4. **Fase 6**: Dashboard Admin + Frontend

---

## 🆘 Troubleshooting

### Erro: "JWT secret not configured"
- Verifique `.env` tem `JWT_SECRET=seu_secret_aqui`
- Verifique `config/jwt.config.ts` está carregando corretamente

### Erro: "Cannot find module @nestjs/passport"
- Execute: `npm install @nestjs/passport passport passport-jwt @types/passport-jwt`

### Erro: "TS1241: Unable to resolve signature of decorator"
- Verifique `tsconfig.json` tem `"experimentalDecorators": true`

### Token não funciona no Swagger
- Clique no botão "Authorize" e cole: `Bearer SEU_TOKEN_AQUI`
- Lembre-se do "Bearer " antes do token!

---

**Desenvolvido com ❤️ para seu sucesso**
