// ==========================================
// Orders Module
// ==========================================

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../events/events.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
