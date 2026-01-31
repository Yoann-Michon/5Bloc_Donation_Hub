import { Module } from '@nestjs/common';
import { PrivilegesController } from './privileges.controller';
import { PrivilegesService } from './privileges.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
  exports: [PrivilegesService],
})
export class PrivilegesModule {}
