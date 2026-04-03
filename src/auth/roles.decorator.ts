import { SetMetadata } from '@nestjs/common';

export const APP_ROLES_KEY = 'app_roles';

/**
 * Route/class decorator for app-level RBAC using Prisma roles.
 *
 * Example:
 * @RequireRoles('admin', 'analyst')
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(
    APP_ROLES_KEY,
    roles.map((role) => role.trim().toLowerCase()).filter(Boolean),
  );
