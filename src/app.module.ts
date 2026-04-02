import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { auth } from '../lib/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { TransactionsController } from './transactions/transactions.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [AuthModule.forRoot({ auth })],
  controllers: [
    AppController,
    UserController,
    AuthController,
    TransactionsController,
    DashboardController,
  ],
  providers: [AppService, UserService, PrismaService, AuthService],
})
export class AppModule {}
