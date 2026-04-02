import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/LoginUserDto';

//Auth controller
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  //Register user endpoint
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @nestjsBetterAuth.AllowAnonymous()
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.registerUserService(registerUserDto);
  }

  //Login user endpoint
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @nestjsBetterAuth.AllowAnonymous()
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.userService.signInUserService(loginUserDto);
  }

  //Logout user endpoint
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logoutUser() {
    return {
      success: true,
      message: 'User logged out successfully',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
