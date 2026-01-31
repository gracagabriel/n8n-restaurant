// ==========================================
// Tables Controller
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
import { TablesService } from './tables.service';
import { JwtAuthGuard, Roles, RoleGuard } from '../../common';

@ApiTags('Mesas')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  /**
   * Criar nova mesa
   * POST /api/tables
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova mesa' })
  async create(
    @Body() body: { number: string; capacity: number; area?: string },
  ) {
    return this.tablesService.create(body);
  }

  /**
   * Listar todas as mesas
   * GET /api/tables
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas as mesas' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 10;
    return this.tablesService.findAll(skipNum, takeNum, status);
  }

  /**
   * Obter mesa por ID
   * GET /api/tables/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter mesa por ID' })
  async findById(@Param('id') id: string) {
    return this.tablesService.findById(id);
  }

  /**
   * Atualizar mesa
   * PUT /api/tables/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar mesa' })
  async update(
    @Param('id') id: string,
    @Body() body: { number?: string; capacity?: number; area?: string; status?: string },
  ) {
    // Cast status to TableStatus if provided
    const updateData: any = { ...body };
    return this.tablesService.update(id, updateData);
  }

  /**
   * Deletar mesa
   * DELETE /api/tables/:id
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar mesa' })
  async delete(@Param('id') id: string) {
    return this.tablesService.delete(id);
  }

  /**
   * Marcar mesa como ocupada
   * PUT /api/tables/:id/occupy
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/occupy')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mesa como ocupada' })
  async markOccupied(@Param('id') id: string) {
    return this.tablesService.markOccupied(id);
  }

  /**
   * Marcar mesa como disponível
   * PUT /api/tables/:id/release
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/release')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mesa como disponível' })
  async markAvailable(@Param('id') id: string) {
    return this.tablesService.markAvailable(id);
  }
}
