import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) { }

  async create(createDonationDto: CreateDonationDto) {
    return this.prisma.donation.create({
      data: createDonationDto,
    });
  }

  async findAll() {
    return this.prisma.donation.findMany({
      include: { donor: true, project: true },
    });
  }

  async findOne(id: number) {
    // Donation ID is String (UUID) in Schema.
    return this.prisma.donation.findUnique({
      where: { id: id.toString() },
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
