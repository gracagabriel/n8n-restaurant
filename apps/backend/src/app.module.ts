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
import { CategoriesModule } from './modules/categories/categories.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { TablesModule } from './modules/tables/tables.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EventsModule } from './modules/events/events.module';
import { EventsGatewayModule } from './gateways/events.module';
import { AdminModule } from './modules/admin/admin.module';

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

    // Categories Module
    CategoriesModule,

    // Menu Items Module
    MenuItemsModule,

    // Tables Module
    TablesModule,

    // Orders Module
    OrdersModule,

    // Payments Module
    PaymentsModule,

    // Events Module
    EventsModule,

    // Events Gateway Module (WebSocket)
    EventsGatewayModule,

    // Admin Module (Dashboard, KDS, ControlPanel)
    AdminModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
