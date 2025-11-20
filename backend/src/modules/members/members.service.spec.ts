import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { PrismaService } from '@/shared/services/prisma.service';
import { MemberStatus } from '@prisma/client';

describe('MembersService', () => {
  let service: MembersService;
  let prismaService: PrismaService;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    passwordHash: 'hashed',
    emailVerified: true,
    emailVerificationToken: null,
    avatarUrl: null,
    language: 'en',
    timezone: 'UTC',
    twoFactorEnabled: false,
    passwordResetToken: null,
    passwordResetExpires: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMember = {
    id: 'member-123',
    tenantId: mockTenantId,
    userId: mockUserId,
    sectionId: null,
    memberNumber: 'M001',
    statusType: 'REGULAR',
    status: MemberStatus.ACTIVE,
    dateOfBirth: null,
    address: '123 Main St',
    city: 'Paris',
    country: 'France',
    cityOfOrigin: 'Douala',
    joinedAt: new Date(),
    membershipDate: new Date(),
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: mockUserId,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    member: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    memberRole: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    contributionPayment: {
      aggregate: jest.fn(),
    },
    eventRegistration: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new member with existing user', async () => {
      const createMemberDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        statusType: 'REGULAR' as any,
        address: '123 Main St',
        city: 'Paris',
        country: 'France',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.member.findFirst
        .mockResolvedValueOnce(null) // No existing member
        .mockResolvedValueOnce(null); // No last member (first member)
      mockPrismaService.member.create.mockResolvedValue(mockMember);

      const result = await service.create(mockTenantId, createMemberDto, mockUserId);

      expect(result).toBeDefined();
      expect(result.memberNumber).toBe('M001');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createMemberDto.email },
      });
      expect(mockPrismaService.member.create).toHaveBeenCalled();
    });

    it('should create a new user if not exists', async () => {
      const createMemberDto = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        statusType: 'REGULAR' as any,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: createMemberDto.email,
      });
      mockPrismaService.member.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ memberNumber: 'M005' });
      mockPrismaService.member.create.mockResolvedValue({
        ...mockMember,
        memberNumber: 'M006',
      });

      const result = await service.create(mockTenantId, createMemberDto, mockUserId);

      expect(result).toBeDefined();
      expect(result.memberNumber).toBe('M006');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.member.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already a member', async () => {
      const createMemberDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        statusType: 'REGULAR' as any,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.member.findFirst.mockResolvedValue(mockMember);

      await expect(
        service.create(mockTenantId, createMemberDto, mockUserId),
      ).rejects.toThrow(ConflictException);

      expect(mockPrismaService.member.create).not.toHaveBeenCalled();
    });

    it('should generate sequential member numbers', async () => {
      const createMemberDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        statusType: 'REGULAR' as any,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.member.findFirst
        .mockResolvedValueOnce(null) // No existing member
        .mockResolvedValueOnce({ memberNumber: 'M042' }); // Last member is M042
      mockPrismaService.member.create.mockResolvedValue({
        ...mockMember,
        memberNumber: 'M043',
      });

      const result = await service.create(mockTenantId, createMemberDto, mockUserId);

      expect(result.memberNumber).toBe('M043');
    });
  });

  describe('findAll', () => {
    it('should return paginated members list', async () => {
      const members = [mockMember];
      const total = 1;

      mockPrismaService.member.findMany.mockResolvedValue(members);
      mockPrismaService.member.count.mockResolvedValue(total);

      const result = await service.findAll(mockTenantId, {
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result.data).toEqual(members);
      expect(result.total).toBe(total);
    });

    it('should filter members by status', async () => {
      mockPrismaService.member.findMany.mockResolvedValue([mockMember]);
      mockPrismaService.member.count.mockResolvedValue(1);

      await service.findAll(mockTenantId, {
        page: 1,
        limit: 10,
        status: MemberStatus.ACTIVE,
      });

      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: MemberStatus.ACTIVE,
          }),
        }),
      );
    });

    it('should search members by name or email', async () => {
      mockPrismaService.member.findMany.mockResolvedValue([mockMember]);
      mockPrismaService.member.count.mockResolvedValue(1);

      await service.findAll(mockTenantId, {
        page: 1,
        limit: 10,
        search: 'John',
      });

      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single member by id', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.findOne(mockTenantId, mockMember.id);

      expect(result).toEqual(mockMember);
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: mockMember.id, tenantId: mockTenantId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockTenantId, 'non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a member successfully', async () => {
      const updateMemberDto = {
        address: '456 New St',
        city: 'Lyon',
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.member.update.mockResolvedValue({
        ...mockMember,
        ...updateMemberDto,
      });

      const result = await service.update(
        mockTenantId,
        mockMember.id,
        updateMemberDto,
        mockUserId,
      );

      expect(result.address).toBe(updateMemberDto.address);
      expect(result.city).toBe(updateMemberDto.city);
      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { id: mockMember.id },
        data: expect.objectContaining(updateMemberDto),
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockTenantId, 'non-existent-id', {}, mockUserId),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.member.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should deactivate a member (soft delete)', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.member.update.mockResolvedValue({
        ...mockMember,
        status: MemberStatus.INACTIVE,
      });

      await service.remove(mockTenantId, mockMember.id, mockUserId);

      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { id: mockMember.id },
        data: {
          status: MemberStatus.INACTIVE,
        },
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.remove(mockTenantId, 'non-existent-id', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return member statistics', async () => {
      const memberId = 'member-123';

      mockPrismaService.contributionPayment.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
      });
      mockPrismaService.eventRegistration.count.mockResolvedValue(10);

      const result = await service.getStats(mockTenantId, memberId);

      expect(result).toHaveProperty('totalContributions');
      expect(result).toHaveProperty('eventsAttended');
      expect(result.totalContributions).toBe(5000);
      expect(result.eventsAttended).toBe(10);
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a member', async () => {
      const roleId = 'role-123';

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.memberRole.findMany.mockResolvedValue([]);
      mockPrismaService.memberRole.create.mockResolvedValue({
        id: 'member-role-123',
        memberId: mockMember.id,
        roleId,
        assignedAt: new Date(),
      });

      const result = await service.assignRole(
        mockTenantId,
        mockMember.id,
        roleId,
        mockUserId,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.memberRole.create).toHaveBeenCalledWith({
        data: {
          memberId: mockMember.id,
          roleId,
        },
      });
    });

    it('should throw ConflictException if role already assigned', async () => {
      const roleId = 'role-123';

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.memberRole.findMany.mockResolvedValue([
        {
          id: 'existing',
          memberId: mockMember.id,
          roleId,
          assignedAt: new Date(),
        },
      ]);

      await expect(
        service.assignRole(mockTenantId, mockMember.id, roleId, mockUserId),
      ).rejects.toThrow(ConflictException);

      expect(mockPrismaService.memberRole.create).not.toHaveBeenCalled();
    });
  });

  describe('removeRole', () => {
    it('should remove a role from a member', async () => {
      const roleId = 'role-123';

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.memberRole.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeRole(mockTenantId, mockMember.id, roleId, mockUserId);

      expect(mockPrismaService.memberRole.deleteMany).toHaveBeenCalledWith({
        where: {
          memberId: mockMember.id,
          roleId,
        },
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.removeRole(mockTenantId, 'non-existent-id', 'role-123', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
