import { Controller, Get } from '@nestjs/common';
import { PrivilegesService } from './privileges.service';

@Controller('privileges')
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) {}

  @Get()
  findAll() {
    return this.privilegesService.findAll();
  }
}
