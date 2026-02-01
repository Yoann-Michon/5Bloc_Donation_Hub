import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { walletAddress: createUserDto.walletAddress },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        role: createUserDto.role || 'USER',
        isActive: true,
        lastLogin: new Date(),
      } as any,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByWallet(walletAddress: string) {
    return this.prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateNonce(walletAddress: string, nonce: string) {
    return this.prisma.user.update({
      where: { walletAddress },
      data: { nonce },
    });
  }

  async updateLastLogin(walletAddress: string) {
    return this.prisma.user.update({
      where: { walletAddress },
      data: { lastLogin: new Date() },
    });
  }

  async changeRole(walletAddress: string, newRole: string, adminWallet: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldRole = user.role;


    const updatedUser = await this.prisma.user.update({
      where: { walletAddress },
      data: { role: newRole as any },
    });


    await this.prisma.roleChangeLog.create({
      data: {
        targetWallet: walletAddress,
        adminWallet,
        oldRole: oldRole as any,
        newRole: newRole as any,
        reason,
      },
    });

    return updatedUser;
  }

  async setActive(walletAddress: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { walletAddress },
      data: { isActive },
    });
  }

  async getRoleChangeLogs() {
    return this.prisma.roleChangeLog.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }
}
