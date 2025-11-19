import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma.service';
import { CreateMemberDto, UpdateMemberDto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new member (either by inviting existing user or creating new one)
   */
  async create(tenantId: string, createMemberDto: CreateMemberDto, currentUserId: string) {
    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email: createMemberDto.email },
    });

    // If user doesn't exist, create them
    if (!user) {
      const temporaryPassword = randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email: createMemberDto.email,
          passwordHash: hashedPassword,
          firstName: createMemberDto.firstName,
          lastName: createMemberDto.lastName,
          phone: createMemberDto.phone,
          emailVerified: false,
          emailVerificationToken: randomBytes(32).toString('hex'),
        },
      });

      // TODO: Send invitation email with temporary password
    }

    // Check if user is already a member of this association
    const existingMember = await this.prisma.member.findFirst({
      where: {
        tenantId,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new ConflictException('This user is already a member of this association');
    }

    // Get the next member number
    const lastMember = await this.prisma.member.findFirst({
      where: { tenantId },
      orderBy: { memberNumber: 'desc' },
    });

    const nextNumber = lastMember
      ? parseInt(lastMember.memberNumber?.replace('M', '') || '0') + 1
      : 1;
    const memberNumber = `M${String(nextNumber).padStart(3, '0')}`;

    // Create member
    const member = await this.prisma.member.create({
      data: {
        tenantId,
        userId: user.id,
        sectionId: createMemberDto.sectionId,
        memberNumber,
        statusType: createMemberDto.statusType || 'ACTIVE',
        dateOfBirth: createMemberDto.dateOfBirth
          ? new Date(createMemberDto.dateOfBirth)
          : undefined,
        address: createMemberDto.address,
        city: createMemberDto.city,
        country: createMemberDto.country,
        cityOfOrigin: createMemberDto.cityOfOrigin,
        membershipDate: createMemberDto.membershipDate
          ? new Date(createMemberDto.membershipDate)
          : new Date(),
        status: 'ACTIVE',
        metadata: createMemberDto.metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Assign default "Member" role
    const memberRole = await this.prisma.role.findFirst({
      where: {
        tenantId,
        slug: 'member',
      },
    });

    if (memberRole) {
      await this.prisma.memberRole.create({
        data: {
          memberId: member.id,
          roleId: memberRole.id,
          assignedBy: currentUserId,
          validFrom: new Date(),
        },
      });
    }

    // Log the creation
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: 'MEMBER_CREATED',
        entityType: 'Member',
        entityId: member.id,
        changes: {
          memberNumber: member.memberNumber,
          email: user.email,
        },
      },
    });

    return member;
  }

  /**
   * Get all members for an association
   */
  async findAll(tenantId: string, query?: any) {
    const where: any = { tenantId };

    // Apply filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.statusType) {
      where.statusType = query.statusType;
    }

    if (query.sectionId) {
      where.sectionId = query.sectionId;
    }

    if (query.search) {
      where.OR = [
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { memberNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatarUrl: true,
            },
          },
          section: {
            select: {
              id: true,
              name: true,
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
          _count: {
            select: {
              contributions: true,
              payments: true,
            },
          },
        },
        skip: query.skip || 0,
        take: query.take || 50,
        orderBy: query.orderBy || { memberNumber: 'asc' },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      total,
      page: Math.floor((query.skip || 0) / (query.take || 50)) + 1,
      pageSize: query.take || 50,
    };
  }

  /**
   * Get a single member by ID
   */
  async findOne(tenantId: string, id: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        section: true,
        roles: {
          include: {
            role: true,
          },
        },
        contributions: {
          include: {
            contributionType: true,
          },
          orderBy: {
            dueDate: 'desc',
          },
          take: 10,
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            contributions: true,
            payments: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  /**
   * Update a member
   */
  async update(
    tenantId: string,
    id: string,
    updateMemberDto: UpdateMemberDto,
    currentUserId: string,
  ) {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Update member
    const updatedMember = await this.prisma.member.update({
      where: { id },
      data: {
        statusType: updateMemberDto.statusType,
        status: updateMemberDto.status,
        dateOfBirth: updateMemberDto.dateOfBirth
          ? new Date(updateMemberDto.dateOfBirth)
          : undefined,
        address: updateMemberDto.address,
        city: updateMemberDto.city,
        country: updateMemberDto.country,
        cityOfOrigin: updateMemberDto.cityOfOrigin,
        sectionId: updateMemberDto.sectionId,
        metadata: updateMemberDto.metadata,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Update user phone if provided
    if (updateMemberDto.phone) {
      await this.prisma.user.update({
        where: { id: member.userId },
        data: { phone: updateMemberDto.phone },
      });
    }

    // Log the update
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: 'MEMBER_UPDATED',
        entityType: 'Member',
        entityId: id,
        changes: updateMemberDto,
      },
    });

    return updatedMember;
  }

  /**
   * Delete a member (soft delete by setting status to INACTIVE)
   */
  async remove(tenantId: string, id: string, currentUserId: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Soft delete
    await this.prisma.member.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updatedAt: new Date(),
      },
    });

    // Log the deletion
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: 'MEMBER_DELETED',
        entityType: 'Member',
        entityId: id,
        changes: { status: 'INACTIVE' },
      },
    });

    return { message: 'Member successfully deactivated' };
  }

  /**
   * Assign role to a member
   */
  async assignRole(
    tenantId: string,
    memberId: string,
    roleId: string,
    currentUserId: string,
    validFrom?: Date,
    validUntil?: Date,
  ) {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Verify role belongs to tenant
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if already assigned
    const existing = await this.prisma.memberRole.findFirst({
      where: {
        memberId,
        roleId,
      },
    });

    if (existing) {
      throw new ConflictException('Member already has this role');
    }

    // Assign role
    const memberRole = await this.prisma.memberRole.create({
      data: {
        memberId,
        roleId,
        assignedBy: currentUserId,
        validFrom: validFrom || new Date(),
        validUntil,
      },
      include: {
        role: true,
      },
    });

    // Log the assignment
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: 'ROLE_ASSIGNED',
        entityType: 'MemberRole',
        entityId: memberRole.id,
        changes: {
          memberId,
          roleId,
          roleName: role.name,
        },
      },
    });

    return memberRole;
  }

  /**
   * Remove role from a member
   */
  async removeRole(tenantId: string, memberId: string, roleId: string, currentUserId: string) {
    const memberRole = await this.prisma.memberRole.findFirst({
      where: {
        memberId,
        roleId,
        member: {
          tenantId,
        },
      },
    });

    if (!memberRole) {
      throw new NotFoundException('Member role assignment not found');
    }

    await this.prisma.memberRole.delete({
      where: { id: memberRole.id },
    });

    // Log the removal
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: 'ROLE_REMOVED',
        entityType: 'MemberRole',
        entityId: memberRole.id,
        changes: {
          memberId,
          roleId,
        },
      },
    });

    return { message: 'Role removed successfully' };
  }

  /**
   * Get member statistics
   */
  async getMemberStats(tenantId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const [contributionsStats, paymentsStats, contributions, payments] = await Promise.all([
      this.prisma.contribution.groupBy({
        by: ['status'],
        where: { memberId },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { memberId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.contribution.findMany({
        where: { memberId },
        orderBy: { dueDate: 'desc' },
        take: 5,
        include: { contributionType: true },
      }),
      this.prisma.payment.findMany({
        where: { memberId },
        orderBy: { paymentDate: 'desc' },
        take: 5,
      }),
    ]);

    const pending = contributionsStats.find((c) => c.status === 'PENDING');
    const overdue = contributionsStats.find((c) => c.status === 'OVERDUE');
    const paid = contributionsStats.find((c) => c.status === 'PAID');

    return {
      contributions: {
        total: contributionsStats.reduce((acc, c) => acc + c._count, 0),
        pending: pending?._count || 0,
        overdue: overdue?._count || 0,
        paid: paid?._count || 0,
        pendingAmount: Number(pending?._sum.amount || 0),
        overdueAmount: Number(overdue?._sum.amount || 0),
      },
      payments: {
        total: paymentsStats._count,
        totalAmount: Number(paymentsStats._sum.amount || 0),
      },
      recent: {
        contributions,
        payments,
      },
    };
  }
}
