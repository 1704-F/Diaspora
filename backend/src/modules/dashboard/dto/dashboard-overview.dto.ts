import { ApiProperty } from '@nestjs/swagger';

export class MemberStatsDto {
  @ApiProperty({ example: 150, description: 'Total number of members' })
  total: number;

  @ApiProperty({ example: 120, description: 'Number of active members' })
  active: number;

  @ApiProperty({ example: 20, description: 'Number of inactive members' })
  inactive: number;

  @ApiProperty({ example: 10, description: 'Number of suspended members' })
  suspended: number;

  @ApiProperty({ example: 15, description: 'New members this month' })
  newThisMonth: number;
}

export class FinancialStatsDto {
  @ApiProperty({ example: 50000.0, description: 'Total revenue' })
  totalRevenue: number;

  @ApiProperty({ example: 30000.0, description: 'Total expenses' })
  totalExpenses: number;

  @ApiProperty({ example: 20000.0, description: 'Current balance' })
  balance: number;

  @ApiProperty({ example: 5000.0, description: 'Revenue this month' })
  revenueThisMonth: number;

  @ApiProperty({ example: 3000.0, description: 'Expenses this month' })
  expensesThisMonth: number;

  @ApiProperty({ example: 45000.0, description: 'Total collected from contributions' })
  contributionsCollected: number;

  @ApiProperty({ example: 50000.0, description: 'Expected contributions amount' })
  contributionsExpected: number;

  @ApiProperty({ example: 90.0, description: 'Contribution compliance rate (%)' })
  complianceRate: number;
}

export class ProjectStatsDto {
  @ApiProperty({ example: 10, description: 'Total number of projects' })
  total: number;

  @ApiProperty({ example: 5, description: 'Projects in progress' })
  inProgress: number;

  @ApiProperty({ example: 3, description: 'Completed projects' })
  completed: number;

  @ApiProperty({ example: 2, description: 'Projects on hold' })
  onHold: number;

  @ApiProperty({ example: 100000.0, description: 'Total budget allocated' })
  totalBudget: number;

  @ApiProperty({ example: 45000.0, description: 'Amount spent' })
  spent: number;

  @ApiProperty({ example: 45.0, description: 'Average budget usage (%)' })
  budgetUsageRate: number;
}

export class EventStatsDto {
  @ApiProperty({ example: 25, description: 'Total number of events' })
  total: number;

  @ApiProperty({ example: 3, description: 'Upcoming events' })
  upcoming: number;

  @ApiProperty({ example: 20, description: 'Past events' })
  past: number;

  @ApiProperty({ example: 2, description: 'Cancelled events' })
  cancelled: number;

  @ApiProperty({ example: 500, description: 'Total registrations' })
  totalRegistrations: number;

  @ApiProperty({ example: 450, description: 'Total attendees' })
  totalAttendees: number;

  @ApiProperty({ example: 90.0, description: 'Average attendance rate (%)' })
  averageAttendanceRate: number;
}

export class ContributionStatsDto {
  @ApiProperty({ example: 5, description: 'Total number of contribution types' })
  totalTypes: number;

  @ApiProperty({ example: 300, description: 'Total contribution payments' })
  totalPayments: number;

  @ApiProperty({ example: 250, description: 'Paid contributions' })
  paid: number;

  @ApiProperty({ example: 30, description: 'Pending contributions' })
  pending: number;

  @ApiProperty({ example: 20, description: 'Overdue contributions' })
  overdue: number;

  @ApiProperty({ example: 83.3, description: 'Payment rate (%)' })
  paymentRate: number;
}

export class RecentActivityDto {
  @ApiProperty({ example: 'member_joined', description: 'Activity type' })
  type: string;

  @ApiProperty({ example: 'John Doe joined as a new member', description: 'Activity description' })
  description: string;

  @ApiProperty({ example: '2025-11-20T10:30:00Z', description: 'Activity timestamp' })
  timestamp: Date;

  @ApiProperty({ example: 'John Doe', description: 'User who performed the activity', required: false })
  user?: string;
}

export class DashboardOverviewDto {
  @ApiProperty({ type: MemberStatsDto, description: 'Member statistics' })
  members: MemberStatsDto;

  @ApiProperty({ type: FinancialStatsDto, description: 'Financial statistics' })
  financial: FinancialStatsDto;

  @ApiProperty({ type: ProjectStatsDto, description: 'Project statistics' })
  projects: ProjectStatsDto;

  @ApiProperty({ type: EventStatsDto, description: 'Event statistics' })
  events: EventStatsDto;

  @ApiProperty({ type: ContributionStatsDto, description: 'Contribution statistics' })
  contributions: ContributionStatsDto;

  @ApiProperty({
    type: [RecentActivityDto],
    description: 'Recent activities (last 10)',
  })
  recentActivities: RecentActivityDto[];

  @ApiProperty({ example: '2025-11-20T15:45:00Z', description: 'Timestamp of data generation' })
  generatedAt: Date;
}
