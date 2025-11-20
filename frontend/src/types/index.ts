// ==================== User & Auth ====================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  language: string;
  timezone?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ==================== Association/Tenant ====================

export interface Association {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  primaryCurrency: string;
  primaryLanguage: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface AssociationStats {
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  totalProjects: number;
  upcomingEvents: number;
}

// ==================== Member ====================

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum MemberType {
  REGULAR = 'REGULAR',
  FOUNDER = 'FOUNDER',
  HONORARY = 'HONORARY',
  STUDENT = 'STUDENT',
  SENIOR = 'SENIOR',
}

export interface Member {
  id: string;
  tenantId: string;
  userId: string;
  sectionId?: string;
  memberNumber: string;
  statusType: MemberType;
  status: MemberStatus;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  cityOfOrigin?: string;
  joinedAt: string;
  membershipDate: string;
  metadata?: Record<string, any>;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  roles?: Role[];
}

export interface MemberStats {
  totalContributions: number;
  eventsAttended: number;
  projectsParticipated: number;
}

// ==================== Role ====================

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Contribution ====================

export enum ContributionType {
  MEMBERSHIP_FEE = 'MEMBERSHIP_FEE',
  DONATION = 'DONATION',
  EVENT_FEE = 'EVENT_FEE',
  SPECIAL = 'SPECIAL',
}

export enum ContributionFrequency {
  ONE_TIME = 'ONE_TIME',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface Contribution {
  id: string;
  tenantId: string;
  type: ContributionType;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: ContributionFrequency;
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionPayment {
  id: string;
  contributionId: string;
  memberId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  member?: Member;
}

export interface ContributionStats {
  totalCollected: number;
  totalExpected: number;
  complianceRate: number;
  unpaidMembers: number;
}

// ==================== Payment ====================

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  CHECK = 'CHECK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

export interface Payment {
  id: string;
  tenantId: string;
  memberId: string;
  contributionPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  member?: Member;
}

// ==================== Project ====================

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  budget: number;
  actualCost: number;
  currency: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  budgetRate: number;
  timeProgress: number;
  totalSpent: number;
}

// ==================== Event ====================

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

export enum EventType {
  MEETING = 'MEETING',
  WORKSHOP = 'WORKSHOP',
  CONFERENCE = 'CONFERENCE',
  SOCIAL = 'SOCIAL',
  CULTURAL = 'CULTURAL',
  FUNDRAISING = 'FUNDRAISING',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  WAITLIST = 'WAITLIST',
}

export interface Event {
  id: string;
  tenantId: string;
  type: EventType;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  registrationDeadline?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  status: RegistrationStatus;
  numberOfGuests: number;
  registeredAt: string;
  updatedAt: string;
  member?: Member;
}

export interface EventStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistCount: number;
  attendanceRate: number;
  availableSpots: number;
}

// ==================== Dashboard ====================

export interface DashboardStats {
  members: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    newThisMonth: number;
  };
  financial: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    revenueThisMonth: number;
    expensesThisMonth: number;
    contributionsCollected: number;
    contributionsExpected: number;
    complianceRate: number;
  };
  projects: {
    total: number;
    inProgress: number;
    completed: number;
    onHold: number;
    totalBudget: number;
    spent: number;
    budgetUsageRate: number;
  };
  events: {
    total: number;
    upcoming: number;
    past: number;
    cancelled: number;
    totalRegistrations: number;
    totalAttendees: number;
    averageAttendanceRate: number;
  };
  contributions: {
    totalTypes: number;
    totalPayments: number;
    paid: number;
    pending: number;
    overdue: number;
    paymentRate: number;
  };
  recentActivities: Array<{
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
  generatedAt: string;
}

// ==================== Common ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
