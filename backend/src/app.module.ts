import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { DonationsModule } from './donations/donations.module';
import { CategoriesModule } from './categories/categories.module';
import { BadgesModule } from './badges/badges.module';
import { PrivilegesModule } from './privileges/privileges.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    ProjectsModule,
    DonationsModule,
    CategoriesModule,
    BadgesModule,
    PrivilegesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
