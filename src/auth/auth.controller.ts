import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';
import { RegisterUserDto } from './dto/RegisterUser.dto';
import { LoginUserDto } from './dto/LoginUser.dto';
import { AuthService } from './auth.service';
import { RequireRoles } from './roles.decorator';

//Auth controller
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Register user endpoint
  @ApiOperation({ summary: 'Register a new user account.' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({ description: 'User registered successfully.' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @nestjsBetterAuth.AllowAnonymous()
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUserService(registerUserDto);
  }

  //Login user endpoint
  @ApiOperation({ summary: 'Authenticate user and return session/token data.' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ description: 'User signed in successfully.' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @nestjsBetterAuth.AllowAnonymous()
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signInUserService(loginUserDto);
  }

  //Logout user endpoint
  @ApiOperation({ summary: 'Sign out the currently authenticated user.' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({ description: 'User signed out successfully.' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @RequireRoles('viewer', 'analyst', 'admin')
  logoutUser() {
    return this.authService.signOutUserService();
  }
}
