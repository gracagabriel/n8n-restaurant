// ==========================================
// Menu Items Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
