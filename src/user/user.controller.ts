import { Body, Controller, Get, Post } from '@nestjs/common';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/RegisterUserDto';

@Controller(['users'])
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getProfile(
    @nestjsBetterAuth.Session() session: nestjsBetterAuth.UserSession,
  ) {
    return { user: session.user };
  }

  @Post('register')
  @nestjsBetterAuth.AllowAnonymous()
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.registerUserService(registerUserDto);
  }
}
