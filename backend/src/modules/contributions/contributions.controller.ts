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
import { ContributionsService } from './contributions.service';
import { CreateContributionDto, UpdateContributionDto } from './dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('Contributions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('associations/:tenantId/contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle cotisation' })
  @ApiResponse({ status: 201, description: 'Cotisation créée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Param('tenantId') tenantId: string,
    @Body() createContributionDto: CreateContributionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionsService.create(
      tenantId,
      createContributionDto,
      userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les cotisations' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isMandatory', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'frequency', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des cotisations' })
  findAll(
    @Param('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query('isActive') isActive?: string,
    @Query('isMandatory') isMandatory?: string,
    @Query('type') type?: string,
    @Query('frequency') frequency?: string,
    @Query('search') search?: string,
  ) {
    return this.contributionsService.findAll(tenantId, userId, {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isMandatory: isMandatory === 'true' ? true : isMandatory === 'false' ? false : undefined,
      type,
      frequency,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une cotisation par ID' })
  @ApiResponse({ status: 200, description: 'Cotisation trouvée' })
  @ApiResponse({ status: 404, description: 'Cotisation introuvable' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionsService.findOne(tenantId, id, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'une cotisation' })
  @ApiResponse({ status: 200, description: 'Statistiques de la cotisation' })
  @ApiResponse({ status: 404, description: 'Cotisation introuvable' })
  getStats(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionsService.getStats(tenantId, id, userId);
  }

  @Get('members/:memberId')
  @ApiOperation({ summary: 'Récupérer les cotisations d\'un membre' })
  @ApiResponse({ status: 200, description: 'Cotisations du membre' })
  @ApiResponse({ status: 404, description: 'Membre introuvable' })
  getMemberContributions(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionsService.getMemberContributions(
      tenantId,
      memberId,
      userId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une cotisation' })
  @ApiResponse({ status: 200, description: 'Cotisation mise à jour' })
  @ApiResponse({ status: 404, description: 'Cotisation introuvable' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateContributionDto: UpdateContributionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionsService.update(
      tenantId,
      id,
      updateContributionDto,
      userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une cotisation' })
  @ApiResponse({ status: 200, description: 'Cotisation supprimée (désactivée)' })
  @ApiResponse({ status: 404, description: 'Cotisation introuvable' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionsService.remove(tenantId, id, userId);
  }
}
