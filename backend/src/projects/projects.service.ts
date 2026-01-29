import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto) {
    const { category, ...data } = createProjectDto;
    return this.prisma.project.create({
      data: {
        ...data,
        categoryId: category,
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

  async remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
