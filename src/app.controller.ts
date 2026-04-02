import { Controller, Get } from '@nestjs/common';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  @nestjsBetterAuth.AllowAnonymous()
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }
}
