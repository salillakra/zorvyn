import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @nestjsBetterAuth.AllowAnonymous()
  getHello(): string {
    return this.appService.apiInfo();
  }

  @Get('api/health')
  @nestjsBetterAuth.AllowAnonymous()
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('ping')
  @ApiExcludeEndpoint()
  @nestjsBetterAuth.AllowAnonymous()
  ping(): { status: string } {
    return { status: 'ok' };
  }
}
