import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { Prisma, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau projet
   */
  async create(
    tenantId: string,
    createProjectDto: CreateProjectDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        tenantId,
        status: createProjectDto.status || 'PLANNING',
        currency: createProjectDto.currency || 'EUR',
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : undefined,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : undefined,
        metadata: createProjectDto.metadata || {},
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'PROJECT_CREATED',
        entityType: 'Project',
        entityId: project.id,
        metadata: { projectName: project.name },
      },
    });

    return project;
  }

  /**
   * Récupérer tous les projets avec filtres
   */
  async findAll(
    tenantId: string,
    userId: string,
    filters?: {
      status?: string;
      category?: string;
      search?: string;
    },
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const where: Prisma.ProjectWhereInput = {
      tenantId,
      ...(filters?.status && { status: filters.status as ProjectStatus }),
      ...(filters?.category && {
        category: { contains: filters.category, mode: 'insensitive' },
      }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          _count: {
            select: {
              contributions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      total,
      metadata: { filters },
    };
  }

  /**
   * Récupérer un projet par ID
   */
  async findOne(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id, tenantId },
      include: {
        contributions: {
          include: {
            payments: {
              where: { status: 'PAID' },
            },
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    return project;
  }

  /**
   * Mettre à jour un projet
   */
  async update(
    tenantId: string,
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id, tenantId },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...updateProjectDto,
        ...(updateProjectDto.startDate && {
          startDate: new Date(updateProjectDto.startDate),
        }),
        ...(updateProjectDto.endDate && {
          endDate: new Date(updateProjectDto.endDate),
        }),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'PROJECT_UPDATED',
        entityType: 'Project',
        entityId: updated.id,
        metadata: { projectName: updated.name },
      },
    });

    return updated;
  }

  /**
   * Supprimer un projet
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    // Si le projet a des cotisations, on le met en statut CANCELLED au lieu de le supprimer
    if (project._count.contributions > 0) {
      const cancelled = await this.prisma.project.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'PROJECT_CANCELLED',
          entityType: 'Project',
          entityId: cancelled.id,
          metadata: { projectName: cancelled.name },
        },
      });

      return cancelled;
    }

    // Sinon, on supprime le projet
    await this.prisma.project.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'PROJECT_DELETED',
        entityType: 'Project',
        entityId: id,
        metadata: { projectName: project.name },
      },
    });

    return { message: 'Projet supprimé avec succès' };
  }

  /**
   * Obtenir les statistiques d'un projet
   */
  async getStats(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id, tenantId },
      include: {
        contributions: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    // Calculer les montants collectés
    let totalCollected = 0;
    let totalPaid = 0;
    let totalPending = 0;

    project.contributions.forEach((contribution) => {
      contribution.payments.forEach((payment) => {
        totalCollected += payment.amount;
        if (payment.status === 'PAID') {
          totalPaid += payment.amount;
        } else if (payment.status === 'PENDING') {
          totalPending += payment.amount;
        }
      });
    });

    // Calcul du taux de réalisation du budget
    const budgetRate = project.budget
      ? (totalPaid / project.budget) * 100
      : 0;

    // Calcul du temps écoulé
    let timeProgress = 0;
    if (project.startDate && project.endDate) {
      const now = new Date();
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      timeProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    }

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        budget: project.budget,
        currency: project.currency,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      financial: {
        budget: project.budget || 0,
        totalCollected,
        totalPaid,
        totalPending,
        remaining: (project.budget || 0) - totalPaid,
        budgetRate: Math.round(budgetRate * 100) / 100,
      },
      contributions: {
        total: project.contributions.length,
        active: project.contributions.filter((c) => c.isActive).length,
      },
      progress: {
        timeProgress: Math.round(timeProgress * 100) / 100,
        budgetProgress: Math.round(budgetRate * 100) / 100,
        status: project.status,
      },
    };
  }

  /**
   * Mettre à jour le statut d'un projet
   */
  async updateStatus(
    tenantId: string,
    id: string,
    status: ProjectStatus,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id, tenantId },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: { status },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'PROJECT_STATUS_UPDATED',
        entityType: 'Project',
        entityId: updated.id,
        metadata: {
          projectName: updated.name,
          oldStatus: project.status,
          newStatus: status,
        },
      },
    });

    return updated;
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
