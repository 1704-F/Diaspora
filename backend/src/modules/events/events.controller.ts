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
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, RegisterEventDto } from './dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('associations/:tenantId/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel événement' })
  @ApiResponse({ status: 201, description: 'Événement créé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Param('tenantId') tenantId: string,
    @Body() createEventDto: CreateEventDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.create(tenantId, createEventDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les événements' })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'past', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des événements' })
  findAll(
    @Param('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query('eventType') eventType?: string,
    @Query('upcoming') upcoming?: string,
    @Query('past') past?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findAll(tenantId, userId, {
      eventType,
      upcoming: upcoming === 'true',
      past: past === 'true',
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un événement par ID' })
  @ApiResponse({ status: 200, description: 'Événement trouvé' })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.findOne(tenantId, id, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un événement' })
  @ApiResponse({ status: 200, description: 'Statistiques de l\'événement' })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  getStats(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.getStats(tenantId, id, userId);
  }

  @Post(':eventId/register')
  @ApiOperation({ summary: 'Inscrire un membre à un événement' })
  @ApiResponse({ status: 201, description: 'Inscription créée avec succès' })
  @ApiResponse({ status: 400, description: 'Membre déjà inscrit ou événement complet' })
  @ApiResponse({ status: 404, description: 'Événement ou membre introuvable' })
  register(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body() registerEventDto: RegisterEventDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.register(
      tenantId,
      eventId,
      registerEventDto,
      userId,
    );
  }

  @Delete(':eventId/registrations/:registrationId')
  @ApiOperation({ summary: 'Annuler une inscription à un événement' })
  @ApiResponse({ status: 200, description: 'Inscription annulée' })
  @ApiResponse({ status: 404, description: 'Inscription introuvable' })
  cancelRegistration(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('registrationId') registrationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.cancelRegistration(
      tenantId,
      eventId,
      registrationId,
      userId,
    );
  }

  @Get('members/:memberId/registrations')
  @ApiOperation({ summary: 'Récupérer les inscriptions d\'un membre' })
  @ApiResponse({ status: 200, description: 'Liste des inscriptions du membre' })
  @ApiResponse({ status: 404, description: 'Membre introuvable' })
  getMemberRegistrations(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.getMemberRegistrations(
      tenantId,
      memberId,
      userId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un événement' })
  @ApiResponse({ status: 200, description: 'Événement mis à jour' })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.update(tenantId, id, updateEventDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un événement' })
  @ApiResponse({ status: 200, description: 'Événement supprimé' })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer un événement avec des inscriptions',
  })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.remove(tenantId, id, userId);
  }
}
