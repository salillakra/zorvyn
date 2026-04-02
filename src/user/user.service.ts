import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { authApi } from '../../lib/auth';

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
}
interface SignInUserInput {
  email: string;
  password: string;
}
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  //Register user service
  async registerUserService({
    name,
    email,
    password,
    image,
    callbackURL,
  }: RegisterUserInput) {
    const data = await authApi.signUpEmail({
      body: {
        name: name, // required
        email: email, // required
        password: password, // required
        image: image,
        callbackURL: callbackURL,
      },
    });
    return {
      success: true,
      message: 'User registered successfully',
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  //Sign in user service
  async signInUserService({ email, password }: SignInUserInput) {
    const data = await authApi.signInEmail({
      body: {
        email: email, // required
        password: password, // required
      },
    });
    return {
      success: true,
      message: 'User signed in successfully',
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  //Sign out user service
  async signOutUserService() {
    const data = await authApi.signOut();
    return {
      success: true,
      message: 'User signed out successfully',
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
