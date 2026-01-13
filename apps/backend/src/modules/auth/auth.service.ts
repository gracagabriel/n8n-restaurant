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
