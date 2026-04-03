import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { authApi } from 'lib/auth';

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
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private isTransientPrismaTimeout(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const code =
      'code' in error && typeof error.code === 'string' ? error.code : '';
    return code === 'ETIMEDOUT' || code === 'P1001';
  }

  private async retryTransientDbError<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!this.isTransientPrismaTimeout(error)) {
        throw error;
      }

      this.logger.warn(
        'Transient database timeout during auth request. Retrying once.',
      );
      await new Promise((resolve) => setTimeout(resolve, 250));
      return operation();
    }
  }

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
    let data: {
      redirect: boolean;
      token: string;
      url?: string | undefined;
      user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
      };
    };

    try {
      data = await this.retryTransientDbError(() =>
        authApi.signInEmail({
          body: {
            email: email, // required
            password: password, // required
          },
        }),
      );
    } catch (error) {
      if (this.isTransientPrismaTimeout(error)) {
        throw new ServiceUnavailableException(
          'Database is temporarily unavailable. Please retry login.',
        );
      }

      throw error;
    }

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
