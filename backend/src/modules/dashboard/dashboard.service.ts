import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import {
  DashboardOverviewDto,
  MemberStatsDto,
  FinancialStatsDto,
  ProjectStatsDto,
  EventStatsDto,
  ContributionStatsDto,
  RecentActivityDto,
} from './dto/dashboard-overview.dto';
import {
  MemberStatus,
  ProjectStatus,
  EventStatus,
  PaymentStatus,
  ContributionStatus,
} from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getOverview(tenantId: string): Promise<DashboardOverviewDto> {
    this.logger.log(`Generating dashboard overview for tenant: ${tenantId}`);

    try {
      // Execute all queries in parallel for better performance
      const [
        members,
        financial,
        projects,
        events,
        contributions,
        recentActivities,
      ] = await Promise.all([
        this.getMemberStats(tenantId),
        this.getFinancialStats(tenantId),
        this.getProjectStats(tenantId),
        this.getEventStats(tenantId),
        this.getContributionStats(tenantId),
        this.getRecentActivities(tenantId),
      ]);

      return {
        members,
        financial,
        projects,
        events,
        contributions,
        recentActivities,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate dashboard overview: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async getMemberStats(tenantId: string): Promise<MemberStatsDto> {
    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [total, active, inactive, suspended, newThisMonth] =
      await Promise.all([
        this.prisma.member.count({ where: { tenantId } }),
        this.prisma.member.count({
          where: { tenantId, status: MemberStatus.ACTIVE },
        }),
        this.prisma.member.count({
          where: { tenantId, status: MemberStatus.INACTIVE },
        }),
        this.prisma.member.count({
          where: { tenantId, status: MemberStatus.SUSPENDED },
        }),
        this.prisma.member.count({
          where: {
            tenantId,
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
        }),
      ]);

    return {
      total,
      active,
      inactive,
      suspended,
      newThisMonth,
    };
  }

  private async getFinancialStats(
    tenantId: string,
  ): Promise<FinancialStatsDto> {
    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    // Get payments (completed)
    const [paidPayments, allPayments, revenueThisMonth] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          status: PaymentStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { tenantId },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          status: PaymentStatus.COMPLETED,
          paymentDate: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const contributionsCollected = Number(paidPayments._sum.amount || 0);
    const contributionsExpected = Number(allPayments._sum.amount || 0);
    const complianceRate =
      contributionsExpected > 0
        ? (contributionsCollected / contributionsExpected) * 100
        : 0;

    const totalRevenue = contributionsCollected;
    const revenueMonth = Number(revenueThisMonth._sum.amount || 0);

    // Get project spending from transactions
    const projectExpenses = await this.prisma.transaction.aggregate({
      where: {
        tenantId,
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    });

    const totalExpenses = Number(projectExpenses._sum.amount || 0);
    const balance = totalRevenue - totalExpenses;

    // Expenses this month
    const expensesMonth = await this.prisma.transaction.aggregate({
      where: {
        tenantId,
        type: 'EXPENSE',
        transactionDate: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
    });

    const expensesThisMonth = Number(expensesMonth._sum.amount || 0);

    return {
      totalRevenue,
      totalExpenses,
      balance,
      revenueThisMonth: revenueMonth,
      expensesThisMonth,
      contributionsCollected,
      contributionsExpected,
      complianceRate: Math.round(complianceRate * 10) / 10,
    };
  }

  private async getProjectStats(tenantId: string): Promise<ProjectStatsDto> {
    const [total, planned, inProgress, completed, cancelled, budgetData, spentData] =
      await Promise.all([
        this.prisma.project.count({ where: { tenantId } }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.PLANNED },
        }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.IN_PROGRESS },
        }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.COMPLETED },
        }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.CANCELLED },
        }),
        this.prisma.project.aggregate({
          where: { tenantId },
          _sum: { budgetAmount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            tenantId,
            type: 'EXPENSE',
            projectId: { not: null },
          },
          _sum: { amount: true },
        }),
      ]);

    const totalBudget = Number(budgetData._sum.budgetAmount || 0);
    const spent = Number(spentData._sum.amount || 0);
    const budgetUsageRate =
      totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

    return {
      total,
      inProgress,
      completed,
      onHold: planned, // Using PLANNED as equivalent to onHold for backwards compatibility
      totalBudget,
      spent,
      budgetUsageRate: Math.round(budgetUsageRate * 10) / 10,
    };
  }

  private async getEventStats(tenantId: string): Promise<EventStatsDto> {
    const now = new Date();

    const [total, upcoming, past, cancelled, participantData] =
      await Promise.all([
        this.prisma.event.count({ where: { tenantId } }),
        this.prisma.event.count({
          where: {
            tenantId,
            status: EventStatus.SCHEDULED,
            startDate: { gte: now },
          },
        }),
        this.prisma.event.count({
          where: {
            tenantId,
            status: EventStatus.COMPLETED,
          },
        }),
        this.prisma.event.count({
          where: { tenantId, status: EventStatus.CANCELLED },
        }),
        this.prisma.eventParticipant.aggregate({
          where: { event: { tenantId } },
          _count: { id: true },
        }),
      ]);

    const totalRegistrations = participantData._count.id || 0;
    const totalAttendees = totalRegistrations;

    // Calculate attendance rate from confirmed participants
    const confirmedParticipants = await this.prisma.eventParticipant.count({
      where: {
        event: { tenantId },
        status: 'CONFIRMED',
      },
    });

    const averageAttendanceRate =
      totalRegistrations > 0
        ? (confirmedParticipants / totalRegistrations) * 100
        : 0;

    return {
      total,
      upcoming,
      past,
      cancelled,
      totalRegistrations,
      totalAttendees,
      averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
    };
  }

  private async getContributionStats(
    tenantId: string,
  ): Promise<ContributionStatsDto> {
    const [totalTypes, contributions] = await Promise.all([
      this.prisma.contributionType.count({ where: { tenantId } }),
      this.prisma.contribution.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

    const paid =
      contributions.find((c) => c.status === ContributionStatus.PAID)?._count
        .id || 0;
    const pending =
      contributions.find((c) => c.status === ContributionStatus.PENDING)
        ?._count.id || 0;
    const overdue =
      contributions.find((c) => c.status === ContributionStatus.OVERDUE)
        ?._count.id || 0;

    const totalPayments = paid + pending + overdue;
    const paymentRate = totalPayments > 0 ? (paid / totalPayments) * 100 : 0;

    return {
      totalTypes,
      totalPayments,
      paid,
      pending,
      overdue,
      paymentRate: Math.round(paymentRate * 10) / 10,
    };
  }

  private async getRecentActivities(
    tenantId: string,
  ): Promise<RecentActivityDto[]> {
    // Get recent audit logs
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return auditLogs.map((log) => ({
      type: log.action,
      description: this.formatActivityDescription(log),
      timestamp: log.createdAt,
      user: log.user
        ? `${log.user.firstName} ${log.user.lastName}`
        : undefined,
    }));
  }

  private formatActivityDescription(log: any): string {
    const action = log.action.toLowerCase();
    const entityType = log.entityType.toLowerCase();

    const actionMap: Record<string, string> = {
      created: 'created',
      updated: 'updated',
      deleted: 'deleted',
      login: 'logged in',
      logout: 'logged out',
      register: 'registered',
    };

    const actionText = actionMap[action] || action;
    const userName = log.user
      ? `${log.user.firstName} ${log.user.lastName}`
      : 'Someone';

    return `${userName} ${actionText} ${entityType} ${log.entityId || ''}`.trim();
  }
}
