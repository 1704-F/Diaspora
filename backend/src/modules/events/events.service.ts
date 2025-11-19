import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma.service';
import { CreateEventDto, UpdateEventDto, RegisterEventDto } from './dto';
import { Prisma, EventType } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouvel événement
   */
  async create(
    tenantId: string,
    createEventDto: CreateEventDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        tenantId,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        isPublic: createEventDto.isPublic ?? false,
        requiresRegistration: createEventDto.requiresRegistration ?? true,
        currency: createEventDto.currency || 'EUR',
        metadata: createEventDto.metadata || {},
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_CREATED',
        entityType: 'Event',
        entityId: event.id,
        metadata: { eventName: event.name },
      },
    });

    return event;
  }

  /**
   * Récupérer tous les événements avec filtres
   */
  async findAll(
    tenantId: string,
    userId: string,
    filters?: {
      eventType?: string;
      upcoming?: boolean;
      past?: boolean;
      search?: string;
    },
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const now = new Date();
    const where: Prisma.EventWhereInput = {
      tenantId,
      ...(filters?.eventType && {
        eventType: filters.eventType as EventType,
      }),
      ...(filters?.upcoming && {
        startDate: { gte: now },
      }),
      ...(filters?.past && {
        endDate: { lt: now },
      }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      total,
      metadata: { filters },
    };
  }

  /**
   * Récupérer un événement par ID
   */
  async findOne(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const event = await this.prisma.event.findUnique({
      where: { id, tenantId },
      include: {
        registrations: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    return event;
  }

  /**
   * Mettre à jour un événement
   */
  async update(
    tenantId: string,
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const event = await this.prisma.event.findUnique({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        ...(updateEventDto.startDate && {
          startDate: new Date(updateEventDto.startDate),
        }),
        ...(updateEventDto.endDate && {
          endDate: new Date(updateEventDto.endDate),
        }),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_UPDATED',
        entityType: 'Event',
        entityId: updated.id,
        metadata: { eventName: updated.name },
      },
    });

    return updated;
  }

  /**
   * Supprimer un événement
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const event = await this.prisma.event.findUnique({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    // Si l'événement a des inscriptions, empêcher la suppression
    if (event._count.registrations > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un événement avec des inscriptions',
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_DELETED',
        entityType: 'Event',
        entityId: id,
        metadata: { eventName: event.name },
      },
    });

    return { message: 'Événement supprimé avec succès' };
  }

  /**
   * Inscrire un membre à un événement
   */
  async register(
    tenantId: string,
    eventId: string,
    registerEventDto: RegisterEventDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    // Vérifier que l'événement existe
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, tenantId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    // Vérifier que le membre existe
    const member = await this.prisma.member.findUnique({
      where: {
        id: registerEventDto.memberId,
        tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    // Vérifier que le membre n'est pas déjà inscrit
    const existingRegistration = await this.prisma.eventRegistration.findFirst(
      {
        where: {
          eventId,
          memberId: registerEventDto.memberId,
        },
      },
    );

    if (existingRegistration) {
      throw new BadRequestException('Le membre est déjà inscrit à cet événement');
    }

    // Vérifier la capacité
    if (event.maxAttendees) {
      const confirmedRegistrations = await this.prisma.eventRegistration.count({
        where: {
          eventId,
          status: 'CONFIRMED',
        },
      });

      if (confirmedRegistrations >= event.maxAttendees) {
        throw new BadRequestException('Événement complet');
      }
    }

    // Créer l'inscription
    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: registerEventDto.memberId,
        status: registerEventDto.status || 'PENDING',
        numberOfGuests: registerEventDto.numberOfGuests || 1,
        notes: registerEventDto.notes,
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        event: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_REGISTRATION_CREATED',
        entityType: 'EventRegistration',
        entityId: registration.id,
        metadata: {
          eventName: event.name,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
        },
      },
    });

    return registration;
  }

  /**
   * Annuler une inscription
   */
  async cancelRegistration(
    tenantId: string,
    eventId: string,
    registrationId: string,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        member: true,
      },
    });

    if (!registration || registration.event.tenantId !== tenantId) {
      throw new NotFoundException('Inscription introuvable');
    }

    if (registration.eventId !== eventId) {
      throw new BadRequestException('Inscription ne correspond pas à cet événement');
    }

    const cancelled = await this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_REGISTRATION_CANCELLED',
        entityType: 'EventRegistration',
        entityId: cancelled.id,
        metadata: {
          eventName: registration.event.name,
        },
      },
    });

    return cancelled;
  }

  /**
   * Obtenir les statistiques d'un événement
   */
  async getStats(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const event = await this.prisma.event.findUnique({
      where: { id, tenantId },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    const totalRegistrations = event.registrations.length;
    const confirmedRegistrations = event.registrations.filter(
      (r) => r.status === 'CONFIRMED',
    ).length;
    const pendingRegistrations = event.registrations.filter(
      (r) => r.status === 'PENDING',
    ).length;
    const cancelledRegistrations = event.registrations.filter(
      (r) => r.status === 'CANCELLED',
    ).length;

    const totalGuests = event.registrations.reduce(
      (sum, r) => sum + (r.numberOfGuests || 1),
      0,
    );

    const availableSpots = event.maxAttendees
      ? event.maxAttendees - confirmedRegistrations
      : null;

    const attendanceRate = event.maxAttendees
      ? (confirmedRegistrations / event.maxAttendees) * 100
      : 0;

    return {
      event: {
        id: event.id,
        name: event.name,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        maxAttendees: event.maxAttendees,
      },
      registrations: {
        total: totalRegistrations,
        confirmed: confirmedRegistrations,
        pending: pendingRegistrations,
        cancelled: cancelledRegistrations,
        totalGuests,
      },
      capacity: {
        maxAttendees: event.maxAttendees,
        availableSpots,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        isFull: event.maxAttendees ? confirmedRegistrations >= event.maxAttendees : false,
      },
    };
  }

  /**
   * Récupérer les inscriptions d'un membre
   */
  async getMemberRegistrations(
    tenantId: string,
    memberId: string,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const member = await this.prisma.member.findUnique({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    const registrations = await this.prisma.eventRegistration.findMany({
      where: { memberId },
      include: {
        event: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return registrations;
  }

  /**
   * Valider l'accès au tenant
   */
  private async validateTenantAccess(tenantId: string, userId: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        tenantId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!member) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette association",
      );
    }

    return member;
  }
}
