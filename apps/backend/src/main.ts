// ==========================================
// Application Bootstrap
// ==========================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Configurar segurança
  app.use(helmet());

  // Configurar CORS
  const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3001').split(',');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar prefixo global da API
  const apiPrefix = process.env.API_PREFIX || '/api';
  app.setGlobalPrefix(apiPrefix);

  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('🍽️ Restaurant Management API')
    .setDescription(
      'API completa de gestão para bar e restaurante de hotel com suporte a pedidos em tempo real, cardápio digital e automações via n8n.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Iniciar servidor
  const port = parseInt(process.env.API_PORT || '3000', 10);
  const host = process.env.API_HOST || '0.0.0.0';

  try {
    const server = await app.listen(port, host);
    
    console.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║  🚀 Restaurant Management API iniciada com sucesso!       ║
    ╠════════════════════════════════════════════════════════════╣
    ║  📍 Endpoint:   http://localhost:${port}                  ║
    ║  📚 Swagger:    http://localhost:${port}${apiPrefix}/docs ║
    ║  🔐 JWT Auth:   Ativada                                    ║
    ║  🗄️  Banco:      PostgreSQL                                ║
    ║  ⚡ Redis:      Ativado para cache e WebSockets           ║
    ╚════════════════════════════════════════════════════════════╝
    `);
    
    server.keepAliveTimeout = 65000;
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar aplicação:', err);
  process.exit(1);
});
