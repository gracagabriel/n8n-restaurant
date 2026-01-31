import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/admin',
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3000/admin'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowEIO3: true,
  },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, Socket>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Notificar que cliente conectou
    this.server.emit('client:connected', {
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);

    // Notificar que cliente desconectou
    this.server.emit('client:disconnected', {
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  /**
   * Event: order:created
   * Emitido quando novo pedido é criado
   */
  emitOrderCreated(order: any) {
    this.logger.log(`Broadcasting order:created - Order #${order.orderNumber}`);
    this.server.emit('order:created', {
      order,
      timestamp: new Date(),
    });
  }

  /**
   * Event: order:status-changed
   * Emitido quando status do pedido muda
   */
  emitOrderStatusChanged(order: any, oldStatus: string) {
    this.logger.log(
      `Broadcasting order:status-changed - Order #${order.orderNumber} (${oldStatus} → ${order.status})`,
    );
    this.server.emit('order:status-changed', {
      order,
      oldStatus,
      newStatus: order.status,
      timestamp: new Date(),
    });
  }

  /**
   * Event: order:completed
   * Emitido quando pedido é completado
   */
  emitOrderCompleted(order: any) {
    this.logger.log(`Broadcasting order:completed - Order #${order.orderNumber}`);
    this.server.emit('order:completed', {
      order,
      timestamp: new Date(),
    });
  }

  /**
   * Event: dashboard:metrics
   * Emitido quando métricas do dashboard mudam
   */
  emitDashboardMetrics(metrics: any) {
    this.logger.log(`Broadcasting dashboard:metrics`);
    this.server.emit('dashboard:metrics', {
      metrics,
      timestamp: new Date(),
    });
  }

  /**
   * Event: kds:update
   * Emitido quando KDS precisa atualizar
   */
  emitKdsUpdate(orders: any[]) {
    this.logger.log(`Broadcasting kds:update - ${orders.length} orders`);
    this.server.emit('kds:update', {
      orders,
      timestamp: new Date(),
    });
  }

  /**
   * Obter número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Broadcast para room específica
   */
  broadcastToRoom(room: string, event: string, data: any) {
    this.logger.log(`Broadcasting to room ${room}: ${event}`);
    this.server.to(room).emit(event, data);
  }

  /**
   * Enviar para cliente específico
   */
  sendToClient(clientId: string, event: string, data: any) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, data);
    }
  }
}
