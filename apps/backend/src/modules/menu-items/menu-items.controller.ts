// ==========================================
// Menu Items Controller
// ==========================================

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Itens do Cardápio')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  /**
   * Criar novo item do menu
   * POST /api/menu-items
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo item do cardápio' })
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      price: number;
      categoryId: string;
      image?: string;
    },
  ) {
    return this.menuItemsService.create(body);
  }

  /**
   * Listar itens do menu
   * GET /api/menu-items
   */
  @Get()
  @ApiOperation({ summary: 'Listar itens do cardápio' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    return this.menuItemsService.findAll(skipNum, takeNum, categoryId);
  }

  /**
   * Obter item por ID
   * GET /api/menu-items/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter item do cardápio por ID' })
  async findById(@Param('id') id: string) {
    return this.menuItemsService.findById(id);
  }

  /**
   * Atualizar item
   * PUT /api/menu-items/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar item do cardápio' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      image?: string;
    },
  ) {
    return this.menuItemsService.update(id, body);
  }

  /**
   * Deletar item
   * DELETE /api/menu-items/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar item do cardápio' })
  async delete(@Param('id') id: string) {
    return this.menuItemsService.delete(id);
  }

  /**
   * Listar itens por categoria
   * GET /api/menu-items/category/:categoryId
   */
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Listar itens por categoria' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.menuItemsService.findByCategory(categoryId);
  }
}
