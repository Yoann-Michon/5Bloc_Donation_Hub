import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrivilegesService } from './privileges.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('privileges')
@UseGuards(JwtAuthGuard)
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) {}

  @Get()
  findAll() {
    return this.privilegesService.findAll();
  }
}
