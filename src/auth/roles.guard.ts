import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { PrismaClient } from '../../generated/prisma/client';
import { APP_ROLES_KEY } from './roles.decorator';
import { authApi } from '../../lib/auth';

interface AuthenticatedRequest {
  user?: {
    id?: string;
  } | null;
  headers?: Record<string, string | string[] | undefined>;
}

interface ErrorWithCode {
  code?: string;
  cause?: unknown;
  body?: {
    code?: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaClient,
  ) {}

  private isTransientPrismaTimeout(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const candidate = error as ErrorWithCode;

    if (candidate.code === 'ETIMEDOUT' || candidate.code === 'P1001') {
      return true;
    }

    if (candidate.body?.code === 'FAILED_TO_GET_SESSION') {
      return true;
    }

    if (candidate.cause) {
      return this.isTransientPrismaTimeout(candidate.cause);
    }

    return false;
  }

  private async getSessionUserIdWithRetry(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<string | undefined> {
    try {
      const sessionResponse: unknown = await authApi.getSession({
        headers: fromNodeHeaders(headers),
      });
      return this.getSessionUserId(sessionResponse);
    } catch (error) {
      if (!this.isTransientPrismaTimeout(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const retryResponse: unknown = await authApi.getSession({
        headers: fromNodeHeaders(headers),
      });

      return this.getSessionUserId(retryResponse);
    }
  }

  private getSessionUserId(session: unknown): string | undefined {
    if (!session || typeof session !== 'object') {
      return undefined;
    }

    const maybeUser = (session as { user?: unknown }).user;
    if (!maybeUser || typeof maybeUser !== 'object') {
      return undefined;
    }

    const maybeUserId = (maybeUser as { id?: unknown }).id;
    return typeof maybeUserId === 'string' ? maybeUserId : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      APP_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    let userId = request.user?.id;

    if (!userId && request.headers) {
      let sessionUserId: string | undefined;

      try {
        sessionUserId = await this.getSessionUserIdWithRetry(request.headers);
      } catch (error) {
        if (this.isTransientPrismaTimeout(error)) {
          throw new ServiceUnavailableException(
            'Authentication service is temporarily unavailable. Please retry.',
          );
        }

        throw error;
      }

      if (sessionUserId) {
        request.user = { id: sessionUserId };
      }

      userId = sessionUserId;
    }

    if (!userId) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user?.role) {
      throw new ForbiddenException('No role is assigned to this user.');
    }

    const currentRoles = [user.role.id, user.role.name]
      .filter((role): role is string => Boolean(role))
      .map((role) => role.toLowerCase());

    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      currentRoles.includes(requiredRole),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
