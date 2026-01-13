// ==========================================
// Config Module
// ==========================================
// Validação e carregamento de variáveis de ambiente

import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'restaurant_user',
  password: process.env.DATABASE_PASSWORD || 'restaurant_password',
  name: process.env.DATABASE_NAME || 'restaurant_db',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.API_PORT || '3000', 10),
  host: process.env.API_HOST || '0.0.0.0',
  prefix: process.env.API_PREFIX || '/api',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || 'redis_password',
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));

export const corsConfig = () => ({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
