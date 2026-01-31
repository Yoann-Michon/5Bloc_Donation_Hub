import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrivilegesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.privilege.findMany({
      orderBy: { requiredTier: 'asc' },
    });
  }

  async findByType(type: string) {
    return this.prisma.privilege.findUnique({
      where: { type: type as any },
    });
  }
}
