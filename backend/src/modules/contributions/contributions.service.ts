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
   * Créer une nouvelle cotisation
   */
  async create(
    tenantId: string,
    createContributionDto: CreateContributionDto,
    userId: string,
  ) {
    // Vérifier que l'utilisateur a accès au tenant
    await this.validateTenantAccess(tenantId, userId);

    const contribution = await this.prisma.contribution.create({
      data: {
        ...createContributionDto,
        tenantId,
        currency: createContributionDto.currency || 'EUR',
        isActive: createContributionDto.isActive ?? true,
        isMandatory: createContributionDto.isMandatory ?? false,
        dueDate: createContributionDto.dueDate
          ? new Date(createContributionDto.dueDate)
          : undefined,
        startDate: createContributionDto.startDate
          ? new Date(createContributionDto.startDate)
          : undefined,
        endDate: createContributionDto.endDate
          ? new Date(createContributionDto.endDate)
          : undefined,
        metadata: createContributionDto.metadata || {},
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CONTRIBUTION_CREATED',
        entityType: 'Contribution',
        entityId: contribution.id,
        metadata: { contributionName: contribution.name },
      },
    });

    return contribution;
  }

  /**
   * Récupérer toutes les cotisations d'une association avec filtres
   */
  async findAll(
    tenantId: string,
    userId: string,
    filters?: {
      isActive?: boolean;
      isMandatory?: boolean;
      type?: string;
      frequency?: string;
      search?: string;
    },
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const where: Prisma.ContributionWhereInput = {
      tenantId,
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.isMandatory !== undefined && {
        isMandatory: filters.isMandatory,
      }),
      ...(filters?.type && { type: filters.type as any }),
      ...(filters?.frequency && { frequency: filters.frequency as any }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [contributions, total] = await Promise.all([
      this.prisma.contribution.findMany({
        where,
        include: {
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contribution.count({ where }),
    ]);

    return {
      data: contributions,
      total,
      metadata: {
        filters,
      },
    };
  }

  /**
   * Récupérer une cotisation par ID
   */
  async findOne(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const contribution = await this.prisma.contribution.findUnique({
      where: { id, tenantId },
      include: {
        payments: {
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
          take: 10,
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!contribution) {
      throw new NotFoundException(
        `Cotisation avec l'ID ${id} introuvable`,
      );
    }

    return contribution;
  }

  /**
   * Mettre à jour une cotisation
   */
  async update(
    tenantId: string,
    id: string,
    updateContributionDto: UpdateContributionDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const contribution = await this.prisma.contribution.findUnique({
      where: { id, tenantId },
    });

    if (!contribution) {
      throw new NotFoundException(
        `Cotisation avec l'ID ${id} introuvable`,
      );
    }

    const updated = await this.prisma.contribution.update({
      where: { id },
      data: {
        ...updateContributionDto,
        ...(updateContributionDto.dueDate && {
          dueDate: new Date(updateContributionDto.dueDate),
        }),
        ...(updateContributionDto.startDate && {
          startDate: new Date(updateContributionDto.startDate),
        }),
        ...(updateContributionDto.endDate && {
          endDate: new Date(updateContributionDto.endDate),
        }),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CONTRIBUTION_UPDATED',
        entityType: 'Contribution',
        entityId: updated.id,
        metadata: { contributionName: updated.name },
      },
    });

    return updated;
  }

  /**
   * Supprimer une cotisation (soft delete en désactivant)
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const contribution = await this.prisma.contribution.findUnique({
      where: { id, tenantId },
    });

    if (!contribution) {
      throw new NotFoundException(
        `Cotisation avec l'ID ${id} introuvable`,
      );
    }

    const deleted = await this.prisma.contribution.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CONTRIBUTION_DELETED',
        entityType: 'Contribution',
        entityId: deleted.id,
        metadata: { contributionName: deleted.name },
      },
    });

    return deleted;
  }

  /**
   * Obtenir les statistiques d'une cotisation
   */
  async getStats(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const contribution = await this.prisma.contribution.findUnique({
      where: { id, tenantId },
    });

    if (!contribution) {
      throw new NotFoundException(
        `Cotisation avec l'ID ${id} introuvable`,
      );
    }

    // Compter les membres actifs
    const totalMembers = await this.prisma.member.count({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
    });

    // Statistiques des paiements
    const [totalPayments, paidPayments, pendingPayments, overduePayments] =
      await Promise.all([
        this.prisma.contributionPayment.count({
          where: { contributionId: id },
        }),
        this.prisma.contributionPayment.count({
          where: { contributionId: id, status: 'PAID' },
        }),
        this.prisma.contributionPayment.count({
          where: { contributionId: id, status: 'PENDING' },
        }),
        this.prisma.contributionPayment.count({
          where: { contributionId: id, status: 'OVERDUE' },
        }),
      ]);

    // Montant total collecté
    const totalCollected = await this.prisma.contributionPayment.aggregate({
      where: { contributionId: id, status: 'PAID' },
      _sum: { amount: true },
    });

    // Montant total attendu
    const totalExpected = contribution.amount * totalMembers;

    // Taux de conformité
    const complianceRate =
      totalMembers > 0 ? (paidPayments / totalMembers) * 100 : 0;

    // Membres n'ayant pas payé
    const membersNotPaid = await this.prisma.member.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        contributionPayments: {
          none: {
            contributionId: id,
            status: 'PAID',
          },
        },
      },
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
      take: 20,
    });

    return {
      contribution: {
        id: contribution.id,
        name: contribution.name,
        amount: contribution.amount,
        currency: contribution.currency,
        frequency: contribution.frequency,
        type: contribution.type,
      },
      payments: {
        total: totalPayments,
        paid: paidPayments,
        pending: pendingPayments,
        overdue: overduePayments,
      },
      financial: {
        totalCollected: totalCollected._sum.amount || 0,
        totalExpected,
        currency: contribution.currency,
      },
      members: {
        total: totalMembers,
        paid: paidPayments,
        notPaid: totalMembers - paidPayments,
        complianceRate: Math.round(complianceRate * 100) / 100,
      },
      membersNotPaid: membersNotPaid.map((m) => ({
        id: m.id,
        memberNumber: m.memberNumber,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
      })),
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
      where: { tenantId, isActive: true },
      include: {
        payments: {
          where: { memberId },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contributions.map((contribution) => ({
      ...contribution,
      payment: contribution.payments[0] || null,
      isPaid: contribution.payments.some((p) => p.status === 'PAID'),
      isPending: contribution.payments.some((p) => p.status === 'PENDING'),
      isOverdue: contribution.payments.some((p) => p.status === 'OVERDUE'),
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
