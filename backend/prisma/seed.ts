import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create a test tenant (association)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Association Test',
      slug: 'association-test',
      type: 'SIMPLE',
      primaryCurrency: 'EUR',
      primaryLanguage: 'fr',
      status: 'ACTIVE',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
    },
  });

  console.log('✅ Created test tenant:', tenant.name);

  // Create test users
  const president = await prisma.user.create({
    data: {
      email: 'president@test.com',
      passwordHash: hashedPassword,
      firstName: 'Amadou',
      lastName: 'Diallo',
      emailVerified: true,
      language: 'fr',
    },
  });

  const treasurer = await prisma.user.create({
    data: {
      email: 'tresorier@test.com',
      passwordHash: hashedPassword,
      firstName: 'Fatou',
      lastName: 'Sow',
      emailVerified: true,
      language: 'fr',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'membre1@test.com',
      passwordHash: hashedPassword,
      firstName: 'Ibrahim',
      lastName: 'Kane',
      emailVerified: true,
      language: 'fr',
    },
  });

  console.log('✅ Created test users');

  // Create system roles
  const presidentRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Président',
      slug: 'president',
      description: 'Président de l\'association',
      permissions: JSON.stringify(['*']), // All permissions
      isSystem: true,
    },
  });

  const treasurerRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Trésorier',
      slug: 'treasurer',
      description: 'Trésorier de l\'association',
      permissions: JSON.stringify([
        'finances.*',
        'payments.*',
        'contributions.*',
        'transactions.*',
        'members.read',
      ]),
      isSystem: true,
    },
  });

  const memberRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Membre',
      slug: 'member',
      description: 'Membre simple',
      permissions: JSON.stringify([
        'profile.read',
        'profile.update',
        'contributions.read.own',
        'payments.read.own',
        'payments.create.own',
        'events.read',
        'projects.read',
      ]),
      isSystem: true,
    },
  });

  console.log('✅ Created system roles');

  // Create members
  const presidentMember = await prisma.member.create({
    data: {
      tenantId: tenant.id,
      userId: president.id,
      memberNumber: 'M001',
      statusType: 'FOUNDER',
      membershipDate: new Date('2020-01-01'),
      status: 'ACTIVE',
      country: 'FR',
      city: 'Paris',
    },
  });

  const treasurerMember = await prisma.member.create({
    data: {
      tenantId: tenant.id,
      userId: treasurer.id,
      memberNumber: 'M002',
      statusType: 'ACTIVE',
      membershipDate: new Date('2020-01-01'),
      status: 'ACTIVE',
      country: 'FR',
      city: 'Lyon',
    },
  });

  const simpleMember = await prisma.member.create({
    data: {
      tenantId: tenant.id,
      userId: member1.id,
      memberNumber: 'M003',
      statusType: 'ACTIVE',
      membershipDate: new Date('2021-06-15'),
      status: 'ACTIVE',
      country: 'US',
      city: 'New York',
    },
  });

  console.log('✅ Created members');

  // Assign roles to members
  await prisma.memberRole.create({
    data: {
      memberId: presidentMember.id,
      roleId: presidentRole.id,
      assignedBy: president.id,
      validFrom: new Date('2020-01-01'),
    },
  });

  await prisma.memberRole.create({
    data: {
      memberId: treasurerMember.id,
      roleId: treasurerRole.id,
      assignedBy: president.id,
      validFrom: new Date('2020-01-01'),
    },
  });

  await prisma.memberRole.create({
    data: {
      memberId: simpleMember.id,
      roleId: memberRole.id,
      assignedBy: president.id,
      validFrom: new Date('2021-06-15'),
    },
  });

  console.log('✅ Assigned roles to members');

  // Create contribution types
  const monthlyContribution = await prisma.contributionType.create({
    data: {
      tenantId: tenant.id,
      name: 'Cotisation Mensuelle',
      description: 'Cotisation mensuelle standard',
      frequency: 'MONTHLY',
      baseAmount: 50.0,
      currency: 'EUR',
      isMandatory: true,
      statusMultipliers: {
        FOUNDER: 0.5,
        BENEFACTOR: 2.0,
        ACTIVE: 1.0,
      },
    },
  });

  console.log('✅ Created contribution types');

  // Create some contributions
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Last month contributions (paid)
  const contribution1 = await prisma.contribution.create({
    data: {
      tenantId: tenant.id,
      memberId: presidentMember.id,
      contributionTypeId: monthlyContribution.id,
      amount: 25.0, // Founder gets 50% discount
      currency: 'EUR',
      dueDate: lastMonth,
      status: 'PAID',
    },
  });

  const contribution2 = await prisma.contribution.create({
    data: {
      tenantId: tenant.id,
      memberId: treasurerMember.id,
      contributionTypeId: monthlyContribution.id,
      amount: 50.0,
      currency: 'EUR',
      dueDate: lastMonth,
      status: 'PAID',
    },
  });

  // Create payments for last month
  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      memberId: presidentMember.id,
      contributionId: contribution1.id,
      amount: 25.0,
      currency: 'EUR',
      paymentMethod: 'CARD',
      paymentDate: lastMonth,
      status: 'COMPLETED',
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      memberId: treasurerMember.id,
      contributionId: contribution2.id,
      amount: 50.0,
      currency: 'EUR',
      paymentMethod: 'CARD',
      paymentDate: lastMonth,
      status: 'COMPLETED',
    },
  });

  // This month contributions (pending)
  await prisma.contribution.createMany({
    data: [
      {
        tenantId: tenant.id,
        memberId: presidentMember.id,
        contributionTypeId: monthlyContribution.id,
        amount: 25.0,
        currency: 'EUR',
        dueDate: thisMonth,
        status: 'PENDING',
      },
      {
        tenantId: tenant.id,
        memberId: treasurerMember.id,
        contributionTypeId: monthlyContribution.id,
        amount: 50.0,
        currency: 'EUR',
        dueDate: thisMonth,
        status: 'PENDING',
      },
      {
        tenantId: tenant.id,
        memberId: simpleMember.id,
        contributionTypeId: monthlyContribution.id,
        amount: 50.0,
        currency: 'EUR',
        dueDate: thisMonth,
        status: 'PENDING',
      },
    ],
  });

  console.log('✅ Created contributions and payments');

  // Create a project
  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      title: 'Construction École Primaire',
      description: 'Construction d\'une école primaire de 3 classes dans le village',
      objectives: 'Permettre l\'accès à l\'éducation pour 150 enfants',
      budgetAmount: 50000.0,
      currency: 'EUR',
      budgetSource: 'global',
      status: 'IN_PROGRESS',
      progressPercentage: 35,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-06-30'),
      responsibleMemberId: presidentMember.id,
      createdBy: president.id,
    },
  });

  console.log('✅ Created test project');

  // Create an event
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);
  await prisma.event.create({
    data: {
      tenantId: tenant.id,
      title: 'Assemblée Générale 2025',
      description: 'Assemblée générale annuelle',
      type: 'AG',
      startDate: nextMonth,
      location: 'Salle Polyvalente, Paris',
      status: 'SCHEDULED',
      createdBy: president.id,
    },
  });

  console.log('✅ Created test event');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📧 Test credentials:');
  console.log('   President: president@test.com / Password123!');
  console.log('   Treasurer: tresorier@test.com / Password123!');
  console.log('   Member: membre1@test.com / Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
