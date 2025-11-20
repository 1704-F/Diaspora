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
  ContributionPaymentStatus,
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
            joinedAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ),
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

    // Get contribution payments
    const [paidContributions, allContributions, revenueThisMonth] =
      await Promise.all([
        this.prisma.contributionPayment.aggregate({
          where: {
            contribution: { tenantId },
            status: ContributionPaymentStatus.PAID,
          },
          _sum: { amount: true },
        }),
        this.prisma.contributionPayment.aggregate({
          where: { contribution: { tenantId } },
          _sum: { amount: true },
        }),
        this.prisma.contributionPayment.aggregate({
          where: {
            contribution: { tenantId },
            status: ContributionPaymentStatus.PAID,
            paidAt: { gte: firstDayOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

    const contributionsCollected = paidContributions._sum.amount || 0;
    const contributionsExpected = allContributions._sum.amount || 0;
    const complianceRate =
      contributionsExpected > 0
        ? (contributionsCollected / contributionsExpected) * 100
        : 0;

    // For now, using contributions as main revenue source
    // In a full implementation, you'd have a Transaction/Payment table
    const totalRevenue = contributionsCollected;
    const revenueMonth = revenueThisMonth._sum.amount || 0;

    // Get project spending
    const projectSpending = await this.prisma.project.aggregate({
      where: { tenantId },
      _sum: { actualCost: true },
    });

    const totalExpenses = projectSpending._sum.actualCost || 0;
    const balance = totalRevenue - totalExpenses;

    // For expenses this month, we'd need a proper transaction table
    // For now, using 0 as placeholder
    const expensesThisMonth = 0;

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
    const [total, inProgress, completed, onHold, budgetData] =
      await Promise.all([
        this.prisma.project.count({ where: { tenantId } }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.IN_PROGRESS },
        }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.COMPLETED },
        }),
        this.prisma.project.count({
          where: { tenantId, status: ProjectStatus.ON_HOLD },
        }),
        this.prisma.project.aggregate({
          where: { tenantId },
          _sum: { budget: true, actualCost: true },
        }),
      ]);

    const totalBudget = budgetData._sum.budget || 0;
    const spent = budgetData._sum.actualCost || 0;
    const budgetUsageRate =
      totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

    return {
      total,
      inProgress,
      completed,
      onHold,
      totalBudget,
      spent,
      budgetUsageRate: Math.round(budgetUsageRate * 10) / 10,
    };
  }

  private async getEventStats(tenantId: string): Promise<EventStatsDto> {
    const now = new Date();

    const [total, upcoming, past, cancelled, registrationData] =
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
            endDate: { lt: now },
          },
        }),
        this.prisma.event.count({
          where: { tenantId, status: EventStatus.CANCELLED },
        }),
        this.prisma.eventRegistration.aggregate({
          where: { event: { tenantId } },
          _count: { id: true },
          _sum: { numberOfGuests: true },
        }),
      ]);

    const totalRegistrations = registrationData._count.id || 0;
    const totalAttendees =
      totalRegistrations + (registrationData._sum.numberOfGuests || 0);

    // Calculate attendance rate from completed events
    const completedEventsWithAttendance = await this.prisma.event.findMany({
      where: {
        tenantId,
        status: EventStatus.COMPLETED,
      },
      select: {
        maxAttendees: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    let averageAttendanceRate = 0;
    if (completedEventsWithAttendance.length > 0) {
      const rates = completedEventsWithAttendance
        .filter((e) => e.maxAttendees && e.maxAttendees > 0)
        .map((e) => (e._count.registrations / e.maxAttendees!) * 100);

      if (rates.length > 0) {
        averageAttendanceRate =
          rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      }
    }

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
    const [totalTypes, payments] = await Promise.all([
      this.prisma.contribution.count({ where: { tenantId } }),
      this.prisma.contributionPayment.groupBy({
        by: ['status'],
        where: { contribution: { tenantId } },
        _count: { id: true },
      }),
    ]);

    const paid =
      payments.find((p) => p.status === ContributionPaymentStatus.PAID)
        ?._count.id || 0;
    const pending =
      payments.find((p) => p.status === ContributionPaymentStatus.PENDING)
        ?._count.id || 0;
    const overdue =
      payments.find((p) => p.status === ContributionPaymentStatus.OVERDUE)
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
    const entity = log.entity.toLowerCase();
    const action = log.action.toLowerCase();

    const actionMap: Record<string, string> = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      login: 'logged in',
      logout: 'logged out',
      register: 'registered',
    };

    const actionText = actionMap[action] || action;
    const userName = log.user
      ? `${log.user.firstName} ${log.user.lastName}`
      : 'Someone';

    return `${userName} ${actionText} ${entity} ${log.entityId || ''}`.trim();
  }
}
