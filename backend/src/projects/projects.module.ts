import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectBlockchainService } from './blockchain.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectBlockchainService],
})
export class ProjectsModule {}
