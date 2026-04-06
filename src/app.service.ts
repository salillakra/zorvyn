import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';

@Injectable()
export class AppService {
  constructor(private readonly userService: UserService) {}
  apiInfo(): string {
    return 'Go to /api for API documentation';
  }

  getHealth(): {
    status: string;
    timestamp: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
