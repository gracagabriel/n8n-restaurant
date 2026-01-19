// ==========================================
// Menu Items Service
// ==========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Criar novo item de menu
   */
  async create(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
  }) {
    // Verificar se categoria existe
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || '',
        price: data.price,
        imageUrl: data.imageUrl || '',
        categoryId: data.categoryId,
      },
    });
  }

  /**
   * Listar itens do menu
   */
  async findAll(skip: number = 0, take: number = 20, categoryId?: string) {
    return this.prisma.menuItem.findMany({
      skip,
      take,
      where: categoryId ? { categoryId } : {},
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter item por ID
   */
  async findById(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }

    return item;
  }

  /**
   * Atualizar item
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      image?: string;
    },
  ) {
    const item = await this.findById(id);

    // Se mudar de categoria, validar
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  /**
   * Deletar item
   */
  async delete(id: string) {
    const item = await this.findById(id);

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  /**
   * Listar itens por categoria
   */
  async findByCategory(categoryId: string) {
    return this.prisma.menuItem.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
    });
  }
}
