// ==========================================
// Categories Controller
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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Categorias')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Criar nova categoria
   * POST /api/categories
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova categoria' })
  async create(@Body() body: { name: string; description?: string }) {
    return this.categoriesService.create(body);
  }

  /**
   * Listar todas as categorias
   * GET /api/categories
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.categoriesService.findAll(skip, take);
  }

  /**
   * Obter categoria por ID
   * GET /api/categories/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  async findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  /**
   * Atualizar categoria
   * PUT /api/categories/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.categoriesService.update(id, body);
  }

  /**
   * Deletar categoria
   * DELETE /api/categories/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar categoria' })
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
