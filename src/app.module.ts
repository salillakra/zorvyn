import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { auth } from '../lib/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { prismaClient, PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { TransactionsController } from './transactions/transactions.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { AuthService } from './auth/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { TransactionsService } from './transactions/transactions.service';
import { PrismaClient } from '../generated/prisma/client';
import { DashboardService } from './dashboard/dashboard.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';

@Module({
  imports: [AuthModule.forRoot({ auth })],
  controllers: [
    UserController,
    AuthController,
    TransactionsController,
    DashboardController,
    CategoriesController,
  ],
  providers: [
    UserService,
    {
      provide: PrismaClient,
      useValue: prismaClient,
    },
    PrismaService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    TransactionsService,
    DashboardService,
    CategoriesService,
  ],
})
export class AppModule {}
