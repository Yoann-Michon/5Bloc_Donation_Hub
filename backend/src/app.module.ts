import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { DonationsModule } from './donations/donations.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule, 
    ProjectsModule, 
    DonationsModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule { }
