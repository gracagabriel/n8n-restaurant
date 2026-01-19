// ==========================================
// Tables Service
// ==========================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { TableStatus } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar nova mesa
   */
  async create(data: { number: string; capacity: number; area?: string }) {
    // Verificar se mesa já existe
    const existing = await this.prisma.table.findUnique({
      where: { number: data.number },
    });

    if (existing) {
      throw new ConflictException('Mesa com este número já existe');
    }

    return this.prisma.table.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        area: data.area || 'Salão',
        status: 'AVAILABLE',
      },
    });
  }

  /**
   * Listar todas as mesas
   */
  async findAll(skip: number = 0, take: number = 10, status?: string) {
    return this.prisma.table.findMany({
      skip,
      take,
      where: status ? { status: status as TableStatus } : {},
      include: {
        orders: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  /**
   * Obter mesa por ID
   */
  async findById(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }

    return table;
  }

  /**
   * Atualizar mesa
   */
  async update(id: string, data: { number?: string; capacity?: number; area?: string; status?: TableStatus }) {
    const table = await this.findById(id);

    return this.prisma.table.update({
      where: { id },
      data,
      include: {
        orders: true,
      },
    });
  }

  /**
   * Deletar mesa
   */
  async delete(id: string) {
    const table = await this.findById(id);

    // Verificar se tem pedidos ativos
    const activeOrders = table.orders.filter(o => o.status !== 'COMPLETED');
    if (activeOrders.length > 0) {
      throw new ConflictException('Não é possível deletar mesa com pedidos ativos');
    }

    return this.prisma.table.delete({
      where: { id },
    });
  }

  /**
   * Marcar mesa como ocupada
   */
  async markOccupied(id: string) {
    const table = await this.findById(id);

    return this.prisma.table.update({
      where: { id },
      data: { status: 'OCCUPIED' },
    });
  }

  /**
   * Marcar mesa como disponível
   */
  async markAvailable(id: string) {
    const table = await this.findById(id);

    return this.prisma.table.update({
      where: { id },
      data: { status: 'AVAILABLE' },
    });
  }
}
