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
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('walletAddress') ownerWallet: string,
  ) {
    return this.projectsService.create({ ...createProjectDto, ownerWallet });
  }

  @Public()
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingProjects() {
    return this.projectsService.findByStatus('PENDING');
  }

  @Get('admin/pending-withdrawal')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingWithdrawal() {
    return this.projectsService.getProjectsPendingWithdrawal();
  }

  @Get('my-projects')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  getMyProjects(@CurrentUser('walletAddress') ownerWallet: string) {
    return this.projectsService.findByOwner(ownerWallet);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  approveProject(
    @Param('id') id: string,
    @CurrentUser('walletAddress') adminWallet: string,
  ) {
    return this.projectsService.approveProject(+id, adminWallet);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectProject(
    @Param('id') id: string,
    @Body() dto: { reason?: string },
    @CurrentUser('walletAddress') adminWallet: string,
  ) {
    return this.projectsService.rejectProject(+id, adminWallet, dto.reason);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('walletAddress') userWallet: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.projectsService.updateWithAuth(+id, updateProjectDto, userWallet, userRole);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('walletAddress') userWallet: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.projectsService.removeWithAuth(+id, userWallet, userRole);
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
