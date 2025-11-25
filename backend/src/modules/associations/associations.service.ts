import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma.service';
import { CreateAssociationDto, UpdateAssociationDto } from './dto';

@Injectable()
export class AssociationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new association with the current user as founder/president
   */
  async create(createAssociationDto: CreateAssociationDto, userId: string) {
    // Check if slug is already taken
    const existingAssociation = await this.prisma.tenant.findUnique({
      where: { slug: createAssociationDto.slug },
    });

    if (existingAssociation) {
      throw new ConflictException('An association with this slug already exists');
    }

    // Create association in a transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the tenant (association)
      const tenant = await tx.tenant.create({
        data: {
          name: createAssociationDto.name,
          slug: createAssociationDto.slug,
          type: createAssociationDto.type || 'SIMPLE',
          logoUrl: createAssociationDto.logoUrl,
          primaryCurrency: createAssociationDto.primaryCurrency,
          primaryLanguage: createAssociationDto.primaryLanguage,
          status: 'ACTIVE',
          subscriptionPlan: createAssociationDto.subscriptionPlan || 'FREE',
          subscriptionStatus: 'ACTIVE',
          settings: createAssociationDto.settings || {},
        },
      });

      // 2. Create default roles (President, Treasurer, Secretary, Member)
      const presidentRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Président',
          slug: 'president',
          description: 'Président de l\'association - Tous les droits',
          permissions: ['*'], // All permissions
          isSystem: true,
        },
      });

      const treasurerRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Trésorier',
          slug: 'treasurer',
          description: 'Trésorier - Gestion financière',
          permissions: [
            'finances.*',
            'payments.*',
            'contributions.*',
            'transactions.*',
            'members.read',
            'projects.read',
          ],
          isSystem: true,
        },
      });

      const secretaryRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Secrétaire Général',
          slug: 'secretary',
          description: 'Secrétaire - Gestion administrative',
          permissions: [
            'members.read',
            'members.update',
            'events.*',
            'projects.read',
            'projects.update',
          ],
          isSystem: true,
        },
      });

      await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Membre',
          slug: 'member',
          description: 'Membre simple',
          permissions: [
            'profile.read',
            'profile.update',
            'contributions.read.own',
            'payments.read.own',
            'payments.create.own',
            'events.read',
            'projects.read',
          ],
          isSystem: true,
        },
      });

      // 3. Create member for the user (founder)
      // Get the next member number for this tenant by counting existing members
      const memberCount = await tx.member.count({
        where: { tenantId: tenant.id },
      });

      const nextNumber = memberCount + 1;
      const memberNumber = `M${String(nextNumber).padStart(3, '0')}`;

      const member = await tx.member.create({
        data: {
          tenantId: tenant.id,
          userId: userId,
          memberNumber,
          statusType: 'FOUNDER',
          membershipDate: new Date(),
          status: 'ACTIVE',
        },
      });

      // 4. Assign President role to the founder
      await tx.memberRole.create({
        data: {
          memberId: member.id,
          roleId: presidentRole.id,
          assignedBy: userId,
          validFrom: new Date(),
        },
      });

      // 5. Log the creation
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: userId,
          action: 'ASSOCIATION_CREATED',
          entityType: 'Tenant',
          entityId: tenant.id,
          changes: {
            name: tenant.name,
            slug: tenant.slug,
          },
        },
      });

      return {
        association: tenant,
        member,
        role: presidentRole,
      };
    });
  }

  /**
   * Get all associations the user is a member of
   */
  async findAllForUser(userId: string) {
    const members = await this.prisma.member.findMany({
      where: { userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            logoUrl: true,
            primaryCurrency: true,
            primaryLanguage: true,
            status: true,
            createdAt: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return members.map((member) => ({
      ...member.tenant,
      membershipInfo: {
        memberId: member.id,
        memberNumber: member.memberNumber,
        statusType: member.statusType,
        membershipDate: member.membershipDate,
        roles: member.roles.map((mr) => mr.role),
      },
    }));
  }

  /**
   * Get a single association by ID
   */
  async findOne(id: string, userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        sections: {
          select: {
            id: true,
            name: true,
            country: true,
            currency: true,
            language: true,
          },
        },
        members: {
          where: { userId },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
            events: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Association not found');
    }

    // Check if user is a member
    if (tenant.members.length === 0) {
      throw new ForbiddenException('You do not have access to this association');
    }

    const { members, ...associationData } = tenant;

    return {
      ...associationData,
      userMembership: members[0],
    };
  }

  /**
   * Get association by slug
   */
  async findBySlug(slug: string, userId?: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        sections: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
        members: userId
          ? {
              where: { userId },
              include: {
                roles: {
                  include: {
                    role: true,
                  },
                },
              },
            }
          : false,
        _count: {
          select: {
            members: true,
            projects: true,
            events: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Association not found');
    }

    return tenant;
  }

  /**
   * Update association
   */
  async update(id: string, updateAssociationDto: UpdateAssociationDto, userId: string) {
    // Check if association exists and user has permission
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Association not found');
    }

    if (tenant.members.length === 0) {
      throw new ForbiddenException('You do not have access to this association');
    }

    // Check if user has permission to update (must be admin/president)
    const hasPermission = tenant.members[0].roles.some((mr) => {
      if (mr.role.slug === 'president') return true;
      if (!mr.role.permissions) return false;

      // permissions is a JsonValue, need to check if it's an array containing '*'
      if (Array.isArray(mr.role.permissions)) {
        return mr.role.permissions.includes('*');
      }
      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to update this association');
    }

    // If slug is being changed, check it's not already taken
    if (updateAssociationDto.slug && updateAssociationDto.slug !== tenant.slug) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { slug: updateAssociationDto.slug },
      });

      if (existingTenant) {
        throw new ConflictException('An association with this slug already exists');
      }
    }

    // Update the tenant
    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...updateAssociationDto,
        updatedAt: new Date(),
      },
    });

    // Log the update
    await this.prisma.auditLog.create({
      data: {
        tenantId: id,
        userId,
        action: 'ASSOCIATION_UPDATED',
        entityType: 'Tenant',
        entityId: id,
        changes: updateAssociationDto as any,
      },
    });

    return updatedTenant;
  }

  /**
   * Delete association (soft delete by setting status to INACTIVE)
   */
  async remove(id: string, userId: string) {
    // Check if association exists and user has permission
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Association not found');
    }

    if (tenant.members.length === 0) {
      throw new ForbiddenException('You do not have access to this association');
    }

    // Only president can delete
    const isPresident = tenant.members[0].roles.some((mr) => mr.role.slug === 'president');

    if (!isPresident) {
      throw new ForbiddenException('Only the president can delete the association');
    }

    // Soft delete (set status to INACTIVE)
    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updatedAt: new Date(),
      },
    });

    // Log the deletion
    await this.prisma.auditLog.create({
      data: {
        tenantId: id,
        userId,
        action: 'ASSOCIATION_DELETED',
        entityType: 'Tenant',
        entityId: id,
        changes: { status: 'INACTIVE' },
      },
    });

    return { message: 'Association successfully deactivated' };
  }

  /**
   * Get association statistics
   */
  async getStats(id: string, userId: string) {
    // Verify user has access
    const member = await this.prisma.member.findFirst({
      where: {
        tenantId: id,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You do not have access to this association');
    }

    // Get various statistics
    const [
      totalMembers,
      activeMembers,
      totalProjects,
      activeProjects,
      upcomingEvents,
      totalContributions,
      pendingContributions,
    ] = await Promise.all([
      this.prisma.member.count({ where: { tenantId: id } }),
      this.prisma.member.count({ where: { tenantId: id, status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { tenantId: id } }),
      this.prisma.project.count({ where: { tenantId: id, status: 'IN_PROGRESS' } }),
      this.prisma.event.count({
        where: {
          tenantId: id,
          startDate: { gte: new Date() },
          status: 'SCHEDULED',
        },
      }),
      this.prisma.contribution.count({ where: { tenantId: id } }),
      this.prisma.contribution.count({ where: { tenantId: id, status: 'PENDING' } }),
    ]);

    // Get financial summary
    const payments = await this.prisma.payment.aggregate({
      where: { tenantId: id, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const transactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { tenantId: id },
      _sum: { amount: true },
    });

    const income = transactions.find((t) => t.type === 'INCOME')?._sum.amount || 0;
    const expense = transactions.find((t) => t.type === 'EXPENSE')?._sum.amount || 0;

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
      },
      events: {
        upcoming: upcomingEvents,
      },
      contributions: {
        total: totalContributions,
        pending: pendingContributions,
      },
      finances: {
        totalPayments: payments._sum.amount || 0,
        totalIncome: income,
        totalExpense: expense,
        balance: Number(income) - Number(expense),
      },
    };
  }
}
