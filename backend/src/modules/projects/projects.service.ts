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
        status: createProjectDto.status || 'PLANNED',
        currency: createProjectDto.currency || 'EUR',
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : undefined,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : undefined,
        metadata: createProjectDto.metadata || {},
        createdBy: userId,
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
        changes: { projectTitle: project.title },
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
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
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
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
        changes: { projectTitle: updated.title },
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
            updates: true,
            transactions: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    // Si le projet a des transactions, on le met en statut CANCELLED au lieu de le supprimer
    if (project._count.transactions > 0) {
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
          changes: { projectTitle: cancelled.title },
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
        changes: { projectTitle: project.title },
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
        transactions: {
          where: {
            type: 'EXPENSE',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    // Calculer les montants dépensés
    let totalSpent = 0;

    project.transactions.forEach((transaction) => {
      if (transaction.type === 'EXPENSE') {
        totalSpent += Number(transaction.amount);
      }
    });

    // Calcul du taux de réalisation du budget
    const budgetRate = project.budgetAmount
      ? (totalSpent / Number(project.budgetAmount)) * 100
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
        title: project.title,
        status: project.status,
        budgetAmount: project.budgetAmount,
        currency: project.currency,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      financial: {
        budget: Number(project.budgetAmount) || 0,
        totalSpent,
        remaining: Number(project.budgetAmount || 0) - totalSpent,
        budgetRate: Math.round(budgetRate * 100) / 100,
      },
      transactions: {
        total: project.transactions.length,
      },
      progress: {
        timeProgress: Math.round(timeProgress * 100) / 100,
        budgetProgress: Math.round(budgetRate * 100) / 100,
        manualProgress: project.progressPercentage,
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
        changes: {
          projectTitle: updated.title,
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
