import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    // Note: The prompt uses +id in controller, but Schema uses UUID string.
    // We need to fix the controller to pass string, or handle it here.
    // However, the User model ID is a String (UUID).
    // The controller passed +id which converts to number (NaN if uuid).
    // We should fix the controller. For now, assuming direct mapping.
    // Wait, let's fix the controller too.
    return this.prisma.user.findUnique({
      where: { id: id.toString() }, // Ensure string
    });
  }

  async findByWallet(walletAddress: string) {
    return this.prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: id.toString() },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id: id.toString() },
    });
  }
}
