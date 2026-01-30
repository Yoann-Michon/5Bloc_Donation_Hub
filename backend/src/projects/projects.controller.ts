import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { WithdrawProjectDto } from './dto/withdraw-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../decorators/role.enum';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('admin/pending-withdrawal')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingWithdrawal() {
    return this.projectsService.getProjectsPendingWithdrawal();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  @Post(':id/withdraw')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  withdrawFunds(
    @Param('id') id: string,
    @Body() withdrawDto: WithdrawProjectDto,
    @CurrentUser('walletAddress') adminWallet: string,
  ) {
    return this.projectsService.withdrawFunds(
      +id,
      withdrawDto.recipientAddress,
      adminWallet,
    );
  }
}
