import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma.service';
import { CreateContributionDto, UpdateContributionDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau type de cotisation
   */
  async create(
    tenantId: string,
    createContributionDto: CreateContributionDto,
    userId: string,
  ) {
    // Vérifier que l'utilisateur a accès au tenant
    await this.validateTenantAccess(tenantId, userId);

    const contributionType = await this.prisma.contributionType.create({
      data: {
        tenantId,
        name: createContributionDto.name,
        description: createContributionDto.description,
        baseAmount: createContributionDto.amount,
        currency: createContributionDto.currency || 'EUR',
        frequency: createContributionDto.frequency,
        isMandatory: createContributionDto.isMandatory ?? false,
        statusMultipliers: createContributionDto.metadata || {},
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CONTRIBUTION_TYPE_CREATED',
        entityType: 'ContributionType',
        entityId: contributionType.id,
        changes: { contributionTypeName: contributionType.name },
      },
    });

    return contributionType;
  }

  /**
   * Récupérer tous les types de cotisations d'une association avec filtres
   */
  async findAll(
    tenantId: string,
    userId: string,
    filters?: {
      isMandatory?: boolean;
      frequency?: string;
      search?: string;
    },
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const where: Prisma.ContributionTypeWhereInput = {
      tenantId,
      ...(filters?.isMandatory !== undefined && {
        isMandatory: filters.isMandatory,
      }),
      ...(filters?.frequency && { frequency: filters.frequency as any }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [contributionTypes, total] = await Promise.all([
      this.prisma.contributionType.findMany({
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
      this.prisma.contributionType.count({ where }),
    ]);

    return {
      data: contributionTypes,
      total,
      metadata: {
        filters,
      },
    };
  }

  /**
   * Récupérer un type de cotisation par ID
   */
  async findOne(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const contributionType = await this.prisma.contributionType.findUnique({
      where: { id, tenantId },
      include: {
        contributions: {
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
            payments: {
              where: { status: 'COMPLETED' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    if (!contributionType) {
      throw new NotFoundException(
        `Type de cotisation avec l'ID ${id} introuvable`,
      );
    }

    return contributionType;
  }

  /**
   * Mettre à jour un type de cotisation
   */
  async update(
    tenantId: string,
    id: string,
    updateContributionDto: UpdateContributionDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const contributionType = await this.prisma.contributionType.findUnique({
      where: { id, tenantId },
    });

    if (!contributionType) {
      throw new NotFoundException(
        `Type de cotisation avec l'ID ${id} introuvable`,
      );
    }

    const updated = await this.prisma.contributionType.update({
      where: { id },
      data: {
        ...(updateContributionDto.name && { name: updateContributionDto.name }),
        ...(updateContributionDto.description && {
          description: updateContributionDto.description,
        }),
        ...(updateContributionDto.amount && {
          baseAmount: updateContributionDto.amount,
        }),
        ...(updateContributionDto.currency && {
          currency: updateContributionDto.currency,
        }),
        ...(updateContributionDto.frequency && {
          frequency: updateContributionDto.frequency,
        }),
        ...(updateContributionDto.isMandatory !== undefined && {
          isMandatory: updateContributionDto.isMandatory,
        }),
        ...(updateContributionDto.metadata && {
          statusMultipliers: updateContributionDto.metadata,
        }),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CONTRIBUTION_TYPE_UPDATED',
        entityType: 'ContributionType',
        entityId: updated.id,
        changes: { contributionTypeName: updated.name },
      },
    });

    return updated;
  }

  /**
   * Supprimer un type de cotisation
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const contributionType = await this.prisma.contributionType.findUnique({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    if (!contributionType) {
      throw new NotFoundException(
        `Type de cotisation avec l'ID ${id} introuvable`,
      );
    }

    // Empêcher la suppression s'il y a des cotisations associées
    if (contributionType._count.contributions > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un type de cotisation avec des cotisations associées',
      );
    }

    await this.prisma.contributionType.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CONTRIBUTION_TYPE_DELETED',
        entityType: 'ContributionType',
        entityId: id,
        changes: { contributionTypeName: contributionType.name },
      },
    });

    return { message: 'Type de cotisation supprimé avec succès' };
  }

  /**
   * Obtenir les statistiques d'un type de cotisation
   */
  async getStats(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const contributionType = await this.prisma.contributionType.findUnique({
      where: { id, tenantId },
      include: {
        contributions: {
          include: {
            payments: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!contributionType) {
      throw new NotFoundException(
        `Type de cotisation avec l'ID ${id} introuvable`,
      );
    }

    // Compter les membres actifs
    const totalMembers = await this.prisma.member.count({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
    });

    // Statistiques des contributions
    const totalContributions = contributionType.contributions.length;
    const paidContributions = contributionType.contributions.filter(
      (c) => c.status === 'PAID',
    ).length;
    const pendingContributions = contributionType.contributions.filter(
      (c) => c.status === 'PENDING',
    ).length;
    const overdueContributions = contributionType.contributions.filter(
      (c) => c.status === 'OVERDUE',
    ).length;

    // Montant total collecté
    let totalCollected = 0;
    contributionType.contributions.forEach((contribution) => {
      contribution.payments.forEach((payment) => {
        totalCollected += Number(payment.amount);
      });
    });

    // Montant total attendu
    const totalExpected = Number(contributionType.baseAmount) * totalMembers;

    // Taux de conformité
    const complianceRate =
      totalMembers > 0 ? (paidContributions / totalMembers) * 100 : 0;

    return {
      contributionType: {
        id: contributionType.id,
        name: contributionType.name,
        baseAmount: contributionType.baseAmount,
        currency: contributionType.currency,
        frequency: contributionType.frequency,
      },
      contributions: {
        total: totalContributions,
        paid: paidContributions,
        pending: pendingContributions,
        overdue: overdueContributions,
      },
      financial: {
        totalCollected,
        totalExpected,
        currency: contributionType.currency,
      },
      members: {
        total: totalMembers,
        paid: paidContributions,
        notPaid: totalMembers - paidContributions,
        complianceRate: Math.round(complianceRate * 100) / 100,
      },
    };
  }

  /**
   * Obtenir les cotisations d'un membre spécifique
   */
  async getMemberContributions(
    tenantId: string,
    memberId: string,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const member = await this.prisma.member.findUnique({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      throw new NotFoundException(`Membre avec l'ID ${memberId} introuvable`);
    }

    const contributions = await this.prisma.contribution.findMany({
      where: { tenantId, memberId },
      include: {
        contributionType: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contributions.map((contribution) => ({
      ...contribution,
      payment: contribution.payments[0] || null,
      isPaid: contribution.status === 'PAID',
      isPending: contribution.status === 'PENDING',
      isOverdue: contribution.status === 'OVERDUE',
    }));
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
