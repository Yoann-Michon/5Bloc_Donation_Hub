import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) { }

  async create(createDonationDto: CreateDonationDto) {
    // Create the donation
    const donation = await this.prisma.donation.create({
      data: createDonationDto,
    });

    // Update the project's raised amount
    await this.prisma.project.update({
      where: { id: createDonationDto.projectId },
      data: {
        raised: {
          increment: createDonationDto.amount,
        },
      },
    });

    return donation;
  }

  async findAll() {
    return this.prisma.donation.findMany({
      include: { project: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.donation.findUnique({
      where: { id: id.toString() },
      include: { project: true },
    });
  }

  async findByDonor(walletAddress: string) {
    return this.prisma.donation.findMany({
      where: { donorWallet: walletAddress },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProject(projectId: number) {
    return this.prisma.donation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReceivedByOwner(ownerWallet: string) {
    return this.prisma.donation.findMany({
      where: {
        project: {
          ownerWallet,
        },
      },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, updateDonationDto: UpdateDonationDto) {
    return this.prisma.donation.update({
      where: { id: id.toString() },
      data: updateDonationDto,
    });
  }

  async remove(id: number) {
    return this.prisma.donation.delete({
      where: { id: id.toString() },
    });
  }
}
