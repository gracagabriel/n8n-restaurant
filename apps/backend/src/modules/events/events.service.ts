// ==========================================
// Events Service - Webhook Dispatcher
// ==========================================

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly webhookUrls: Record<string, string> = {
    orderCreated: process.env.WEBHOOK_ORDER_CREATED || '',
    orderStatusUpdated: process.env.WEBHOOK_ORDER_STATUS_UPDATED || '',
    orderCancelled: process.env.WEBHOOK_ORDER_CANCELLED || '',
    paymentCreated: process.env.WEBHOOK_PAYMENT_CREATED || '',
    paymentConfirmed: process.env.WEBHOOK_PAYMENT_CONFIRMED || '',
    paymentFailed: process.env.WEBHOOK_PAYMENT_FAILED || '',
  };

  /**
   * Disparar evento de webhook
   */
  async dispatchWebhook(event: string, payload: any): Promise<void> {
    const webhookUrl = this.webhookUrls[event];

    if (!webhookUrl) {
      this.logger.warn(`Webhook URL não configurada para evento: ${event}`);
      return;
    }

    const webhookPayload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    try {
      this.logger.log(`Disparando webhook para ${event} em ${webhookUrl}`);

      await axios.post(webhookUrl, webhookPayload, {
        timeout: 5000, // 5 segundos
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': webhookPayload.timestamp,
        },
      });

      this.logger.log(`Webhook disparado com sucesso para ${event}`);
    } catch (error) {
      // Não falhar a request se webhook falhar
      // n8n pode estar offline temporariamente
      this.logger.error(
        `Erro ao disparar webhook para ${event}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }

  /**
   * Disparar evento: Novo Pedido Criado
   */
  async onOrderCreated(order: any): Promise<void> {
    await this.dispatchWebhook('orderCreated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      userId: order.userId,
      totalItems: order.items?.length || 0,
      totalAmount: order.items?.reduce(
        (sum: number, item: any) => sum + item.unitPrice * item.quantity,
        0,
      ) || 0,
      createdAt: order.createdAt,
    });
  }

  /**
   * Disparar evento: Status do Pedido Atualizado
   */
  async onOrderStatusUpdated(order: any, oldStatus: string): Promise<void> {
    await this.dispatchWebhook('orderStatusUpdated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus: order.status,
      tableId: order.tableId,
      updatedAt: order.updatedAt,
    });
  }

  /**
   * Disparar evento: Pedido Cancelado
   */
  async onOrderCancelled(order: any): Promise<void> {
    await this.dispatchWebhook('orderCancelled', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      cancelledAt: new Date().toISOString(),
      reason: order.notes || 'Sem motivo especificado',
    });
  }

  /**
   * Disparar evento: Pagamento Criado
   */
  async onPaymentCreated(payment: any): Promise<void> {
    await this.dispatchWebhook('paymentCreated', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    });
  }

  /**
   * Disparar evento: Pagamento Confirmado
   */
  async onPaymentConfirmed(payment: any): Promise<void> {
    await this.dispatchWebhook('paymentConfirmed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      confirmedAt: new Date().toISOString(),
    });
  }

  /**
   * Disparar evento: Pagamento Falhou
   */
  async onPaymentFailed(payment: any, reason: string): Promise<void> {
    await this.dispatchWebhook('paymentFailed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      reason,
      failedAt: new Date().toISOString(),
    });
  }
}
