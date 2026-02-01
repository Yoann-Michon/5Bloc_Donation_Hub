import { PrismaClient, BadgeTier, PrivilegeType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';


const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/donation_hub';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
      requiredTier: BadgeTier.DIAMOND,
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


  const educationCategory = await prisma.category.findUnique({ where: { slug: 'education' } });
  const environmentCategory = await prisma.category.findUnique({ where: { slug: 'environment' } });
  const healthCategory = await prisma.category.findUnique({ where: { slug: 'health' } });
  const defiCategory = await prisma.category.findUnique({ where: { slug: 'defi' } });
  const gamingCategory = await prisma.category.findUnique({ where: { slug: 'gaming' } });
  const infrastructureCategory = await prisma.category.findUnique({ where: { slug: 'infrastructure' } });


  const associationWallet1 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const associationWallet2 = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
  const adminWallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  const projects = [
    {
      title: 'Clean Water for Rural Schools',
      description: 'This project aims to install water filtration systems in 50 rural schools across developing regions. Access to clean water is fundamental for student health and attendance. Each system can serve up to 500 students daily.',
      goal: 5.0,
      raised: 0,
      status: 'FUNDRAISING',
      categoryId: educationCategory?.id,
      ownerWallet: associationWallet1,
      image: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2026-01-15'),
    },
    {
      title: 'Reforestation Initiative Amazon',
      description: 'Join our mission to plant 100,000 native trees in deforested areas of the Amazon rainforest. Each donation helps restore biodiversity, combat climate change, and support local indigenous communities.',
      goal: 10.0,
      raised: 0,
      status: 'FUNDRAISING',
      categoryId: environmentCategory?.id,
      ownerWallet: associationWallet1,
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2026-01-10'),
    },
    {
      title: 'Mobile Health Clinics',
      description: 'Funding mobile health clinics to bring essential medical services to underserved communities. Our fleet of 5 vehicles will provide vaccinations, basic health screenings, and maternal care.',
      goal: 15.0,
      raised: 0,
      status: 'COMPLETED',
      categoryId: healthCategory?.id,
      ownerWallet: associationWallet2,
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2025-12-01'),
      fundsWithdrawn: true,
      withdrawnBy: associationWallet2,
      withdrawnAt: new Date('2026-01-20'),
    },
    {
      title: 'Blockchain Scholarship Fund',
      description: 'Creating scholarships for students from developing countries to learn blockchain development. Recipients will receive 12 months of training, mentorship, and job placement assistance.',
      goal: 8.0,
      raised: 0,
      status: 'PENDING',
      categoryId: educationCategory?.id,
      ownerWallet: associationWallet2,
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800',
    },
    {
      title: 'DeFi Literacy Program',
      description: 'Educational program teaching decentralized finance concepts to underbanked communities. Participants will learn about savings, lending, and financial independence through hands-on workshops.',
      goal: 3.5,
      raised: 0,
      status: 'FUNDRAISING',
      categoryId: defiCategory?.id,
      ownerWallet: associationWallet1,
      image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2026-01-25'),
    },
    {
      title: 'Gaming for Good - Youth Centers',
      description: 'Setting up gaming centers in youth shelters to provide safe spaces for at-risk youth. Each center includes gaming equipment, internet access, and mentorship programs.',
      goal: 6.0,
      raised: 0,
      status: 'FUNDRAISING',
      categoryId: gamingCategory?.id,
      ownerWallet: associationWallet2,
      image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2026-01-18'),
    },
    {
      title: 'Solar Panels for Community Center',
      description: 'Installing solar panel infrastructure at a community center serving 2,000 families. This will reduce energy costs by 80% and provide reliable power for essential services.',
      goal: 12.0,
      raised: 0,
      status: 'REJECTED',
      categoryId: infrastructureCategory?.id,
      ownerWallet: associationWallet1,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    },
    {
      title: 'Ocean Cleanup Initiative',
      description: 'Deploying autonomous cleanup systems to remove plastic waste from coastal waters. Each unit can collect up to 1 ton of debris per month, protecting marine ecosystems.',
      goal: 20.0,
      raised: 0,
      status: 'FUNDRAISING',
      categoryId: environmentCategory?.id,
      ownerWallet: associationWallet2,
      image: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2026-01-05'),
    },
    {
      title: 'Mental Health App Development',
      description: 'Building a free mental health support app with AI-powered counseling, meditation guides, and crisis resources. The app will be available in 10 languages.',
      goal: 7.5,
      raised: 0,
      status: 'PENDING',
      categoryId: healthCategory?.id,
      ownerWallet: associationWallet1,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    },
    {
      title: 'Play-to-Earn for Charity',
      description: 'Creating a blockchain game where players earn tokens that are automatically donated to verified charities. Combining gaming entertainment with social impact.',
      goal: 25.0,
      raised: 0,
      status: 'FUNDRAISING',
      categoryId: gamingCategory?.id,
      ownerWallet: associationWallet1,
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=800',
      approvedBy: adminWallet,
      approvedAt: new Date('2026-01-12'),
    },
  ];

  for (const project of projects) {
    if (!project.categoryId) continue;


    const existing = await prisma.project.findFirst({
      where: { title: project.title },
    });

    if (!existing) {
      await prisma.project.create({
        data: {
          title: project.title,
          description: project.description,
          goal: project.goal,
          raised: project.raised,
          status: project.status as any,
          categoryId: project.categoryId,
          ownerWallet: project.ownerWallet,
          image: project.image,
          approvedBy: project.approvedBy,
          approvedAt: project.approvedAt,
          fundsWithdrawn: project.fundsWithdrawn || false,
          withdrawnBy: project.withdrawnBy,
          withdrawnAt: project.withdrawnAt,
        },
      });
    }
  }

  console.log('✅ Database seeded successfully with categories, privileges, and projects!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
