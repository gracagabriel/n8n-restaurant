// ==========================================
// Users Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  exports: [UsersService], // Exportar para usar em outros módulos
})
export class UsersModule {}
