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
   * POST /api/auth/me
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
