import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../decorators/role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':walletAddress/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeUserRole(
    @Param('walletAddress') walletAddress: string,
    @Body() dto: { newRole: string; reason?: string },
    @CurrentUser('walletAddress') adminWallet: string,
  ) {
    return this.usersService.changeRole(walletAddress, dto.newRole, adminWallet, dto.reason);
  }

  @Patch(':walletAddress/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async activateUser(@Param('walletAddress') walletAddress: string) {
    return this.usersService.setActive(walletAddress, true);
  }

  @Patch(':walletAddress/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deactivateUser(@Param('walletAddress') walletAddress: string) {
    return this.usersService.setActive(walletAddress, false);
  }

  @Get('role-change-logs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRoleChangeLogs() {
    return this.usersService.getRoleChangeLogs();
  }
}
