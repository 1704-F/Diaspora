import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ProjectStatus } from '@prisma/client';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('associations/:tenantId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Param('tenantId') tenantId: string,
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.create(tenantId, createProjectDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des projets' })
  findAll(
    @Param('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll(tenantId, userId, {
      status,
      category,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par ID' })
  @ApiResponse({ status: 200, description: 'Projet trouvé' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.findOne(tenantId, id, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un projet' })
  @ApiResponse({ status: 200, description: 'Statistiques du projet' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  getStats(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.getStats(tenantId, id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.update(tenantId, id, updateProjectDto, userId);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un projet' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  updateStatus(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Param('status') status: ProjectStatus,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.updateStatus(tenantId, id, status, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiResponse({
    status: 200,
    description: 'Projet supprimé ou marqué comme annulé',
  })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.remove(tenantId, id, userId);
  }
}
