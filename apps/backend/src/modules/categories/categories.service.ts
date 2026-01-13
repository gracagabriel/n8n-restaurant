// ==========================================
// Categories Service
// ==========================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar nova categoria
   */
  async create(data: { name: string; description?: string }) {
    // Verificar se categoria já existe
    const existing = await this.prisma.category.findUnique({
      where: { name: data.name },
    });
    
    if (existing) {
      throw new ConflictException('Categoria já existe com este nome');
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description || '',
      },
    });
  }

  /**
   * Listar todas as categorias
   */
  async findAll(skip: number = 0, take: number = 10) {
    return this.prisma.category.findMany({
      skip,
      take,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter categoria por ID
   */
  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Atualizar categoria
   */
  async update(id: string, data: { name?: string; description?: string }) {
    const category = await this.findById(id);

    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });
  }

  /**
   * Deletar categoria
   */
  async delete(id: string) {
    const category = await this.findById(id);

    // Verificar se tem itens associados
    if (category.items.length > 0) {
      throw new ConflictException('Não é possível deletar categoria com itens associados');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Contar itens da categoria
   */
  async countItems(id: string): Promise<number> {
    return this.prisma.menuItem.count({
      where: { categoryId: id },
    });
  }
}
