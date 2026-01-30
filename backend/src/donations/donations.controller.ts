import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../decorators/role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';

@Controller('donations')
@UseGuards(JwtAuthGuard)
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) { }

  @Post()
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.donationsService.findAll();
  }

  @Get('by-wallet/:walletAddress')
  getDonationsByWallet(@Param('walletAddress') walletAddress: string) {
    return this.donationsService.findByDonor(walletAddress);
  }

  @Public()
  @Get('by-project/:projectId')
  getDonationsByProject(@Param('projectId') projectId: string) {
    return this.donationsService.findByProject(+projectId);
  }

  @Get('received')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  getReceivedDonations(@CurrentUser('walletAddress') ownerWallet: string) {
    return this.donationsService.findReceivedByOwner(ownerWallet);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donationsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateDonationDto: UpdateDonationDto) {
    return this.donationsService.update(+id, updateDonationDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.donationsService.remove(+id);
  }
}
