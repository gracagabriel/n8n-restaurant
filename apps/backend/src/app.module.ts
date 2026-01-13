// ==========================================
// App Module (Root)
// ==========================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './database';
import { AppController } from './app.controller';
import { databaseConfig, jwtConfig, appConfig, redisConfig } from './config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
    }),

    // Cache com Redis
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5 minutos padrão
    }),

    // Database
    DatabaseModule,

    // Users Module
    UsersModule,

    // Auth Module
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
