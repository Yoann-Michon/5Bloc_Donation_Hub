import { PrismaClient, BadgeTier, PrivilegeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: 'Education',
      slug: 'education',
      description: 'Educational projects and scholarships',
      icon: '📚',
      color: '#3B82F6',
    },
    {
      name: 'Environment',
      slug: 'environment',
      description: 'Environmental protection and sustainability',
      icon: '🌍',
      color: '#10B981',
    },
    {
      name: 'Health',
      slug: 'health',
      description: 'Healthcare and medical research',
      icon: '🏥',
      color: '#EF4444',
    },
    {
      name: 'DeFi',
      slug: 'defi',
      description: 'Decentralized Finance projects',
      icon: '💰',
      color: '#F59E0B',
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      description: 'Gaming and entertainment projects',
      icon: '🎮',
      color: '#8B5CF6',
    },
    {
      name: 'Infrastructure',
      slug: 'infrastructure',
      description: 'Public infrastructure and utilities',
      icon: '🏗️',
      color: '#6B7280',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const privileges = [
    {
      type: PrivilegeType.VOTE_ON_PROPOSALS,
      name: 'Vote on Proposals',
      description: 'Ability to vote on community proposals',
      requiredTier: BadgeTier.SILVER,
    },
    {
      type: PrivilegeType.EARLY_ACCESS_PROJECTS,
      name: 'Early Access to Projects',
      description: 'Get notified and access new projects before public launch',
      requiredTier: BadgeTier.GOLD,
    },
    {
      type: PrivilegeType.CREATE_PROPOSALS,
      name: 'Create Proposals',
      description: 'Submit proposals for community voting',
      requiredTier: BadgeTier.GOLD,
    },
    {
      type: PrivilegeType.PARTICIPATE_GOVERNANCE,
      name: 'Participate in Governance',
      description: 'Full governance rights and decision-making power',
      requiredTier: BadgeTier.LEGENDARY,
    },
    {
      type: PrivilegeType.REDUCED_FEES,
      name: 'Reduced Platform Fees',
      description: 'Lower fees on transactions and donations',
      requiredTier: BadgeTier.SILVER,
    },
    {
      type: PrivilegeType.PRIORITY_SUPPORT,
      name: 'Priority Support',
      description: 'Get priority assistance from support team',
      requiredTier: BadgeTier.GOLD,
    },
  ];

  for (const privilege of privileges) {
    await prisma.privilege.upsert({
      where: { type: privilege.type },
      update: {},
      create: privilege,
    });
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
