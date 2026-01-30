import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectBlockchainService } from './blockchain.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: ProjectBlockchainService,
  ) { }

  async create(createProjectDto: CreateProjectDto & { ownerWallet?: string }) {
    const { category, ownerWallet, ...data } = createProjectDto;
    return this.prisma.project.create({
      data: {
        ...data,
        categoryId: category,
        ownerWallet: ownerWallet || '',
        status: 'PENDING',
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: { category: true, donations: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { category: true, donations: true },
    });
  }

  async findByStatus(status: string) {
    return this.prisma.project.findMany({
      where: { status: status as any },
      include: { category: true, donations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOwner(ownerWallet: string) {
    return this.prisma.project.findMany({
      where: { ownerWallet },
      include: { category: true, donations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveProject(id: number, adminWallet: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING projects can be approved');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: adminWallet,
        approvedAt: new Date(),
      },
    });
  }

  async rejectProject(id: number, adminWallet: string, reason?: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING projects can be rejected');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: adminWallet,
        approvedAt: new Date(),
      },
    });
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const { category, ...data } = updateProjectDto;
    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(category && { categoryId: category }),
      },
    });
  }

  async updateWithAuth(id: number, updateProjectDto: UpdateProjectDto, userWallet: string, userRole: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // ADMIN can update any project
    if (userRole === 'ADMIN') {
      return this.update(id, updateProjectDto);
    }

    // Owner can only update their own projects
    if (project.ownerWallet.toLowerCase() !== userWallet.toLowerCase()) {
      throw new ForbiddenException('You can only update your own projects');
    }

    // Owner can only update PENDING or APPROVED projects
    if (!['PENDING', 'APPROVED'].includes(project.status)) {
      throw new BadRequestException('Cannot update project in current status');
    }

    return this.update(id, updateProjectDto);
  }

  async remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async removeWithAuth(id: number, userWallet: string, userRole: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // ADMIN can delete any project
    if (userRole === 'ADMIN') {
      return this.remove(id);
    }

    // Owner can only delete their own projects
    if (project.ownerWallet.toLowerCase() !== userWallet.toLowerCase()) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    // Owner can only delete PENDING projects
    if (project.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING projects can be deleted');
    }

    return this.remove(id);
  }

  async getProjectsPendingWithdrawal() {
    return this.prisma.project.findMany({
      where: {
        status: 'COMPLETED',
        fundsWithdrawn: false,
      },
      include: { category: true, donations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async withdrawFunds(projectId: number, recipientAddress: string, adminWallet: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== 'COMPLETED') {
      throw new BadRequestException('Project must be COMPLETED to withdraw funds');
    }

    if (project.fundsWithdrawn) {
      throw new BadRequestException('Funds already withdrawn');
    }

    if (project.ownerWallet.toLowerCase() !== recipientAddress.toLowerCase()) {
      throw new BadRequestException('Recipient must be project owner');
    }

    // Get balance from blockchain
    const balance = await this.blockchainService.getProjectBalance(projectId);

    if (parseFloat(balance) === 0) {
      throw new BadRequestException('No funds available on blockchain');
    }

    // Set project owner in contract if not already set
    try {
      await this.blockchainService.setProjectOwner(projectId, recipientAddress);
    } catch (error) {
      // Owner might already be set, continue
    }

    // Withdraw funds via blockchain
    const txHash = await this.blockchainService.withdrawProjectFunds(
      projectId,
      recipientAddress,
    );

    // Update database
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        fundsWithdrawn: true,
        withdrawnBy: adminWallet,
        withdrawnAt: new Date(),
      },
    });

    return { txHash, amount: balance, recipient: recipientAddress };
  }
}
