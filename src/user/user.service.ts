import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { authApi } from '../../lib/auth';
import { PrismaClient } from '../../generated/prisma/client';
import { UpdateUserDto } from './dto/UpdateUser.dto';

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
  constructor(private readonly prisma: PrismaClient) {}

  private readonly logger = new Logger(UserService.name);

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

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        error: 'User not found.',
      };
    }

    return user;
  }

  async updateUser(id: string, body: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      return {
        statusCode: 404,
        error: 'User not found.',
      };
    }

    if (body.roleId) {
      const roleExists = await this.prisma.role.findUnique({
        where: { id: body.roleId },
        select: { id: true },
      });

      if (!roleExists) {
        return {
          statusCode: 400,
          error: 'Invalid roleId provided.',
        };
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        image: body.image,
        status: body.status,
        roleId: body.roleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedAt: true,
      },
    });

    return {
      statusCode: 200,
      message: 'User updated successfully.',
      data: updatedUser,
    };
  }

  async deleteUser(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingUser) {
      return {
        statusCode: 404,
        error: 'User not found.',
      };
    }

    if (existingUser.status === 'inactive') {
      return {
        statusCode: 200,
        message: 'User already inactive.',
      };
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        status: 'inactive',
      },
    });

    return {
      statusCode: 200,
      message: 'User deactivated successfully.',
    };
  }
}
