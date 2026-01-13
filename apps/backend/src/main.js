"use strict";
// ==========================================
// Application Bootstrap
// ==========================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    // Configurar segurança
    app.use((0, helmet_1.default)());
    // Configurar CORS
    const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3001').split(',');
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    // Configurar validação global
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Configurar prefixo global da API
    const apiPrefix = process.env.API_PREFIX || '/api';
    app.setGlobalPrefix(apiPrefix);
    // Configurar Swagger/OpenAPI
    const config = new swagger_1.DocumentBuilder()
        .setTitle('🍽️ Restaurant Management API')
        .setDescription('API completa de gestão para bar e restaurante de hotel com suporte a pedidos em tempo real, cardápio digital e automações via n8n.')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'bearer')
        .addApiKey({
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
    }, 'api-key')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
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
    }
    catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}
bootstrap().catch((err) => {
    console.error('❌ Erro ao iniciar aplicação:', err);
    process.exit(1);
});
