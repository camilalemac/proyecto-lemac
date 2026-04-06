import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";

export const checkPermissions = (
  requiredRoles: string[] = [],
  requiredPermissions: string[] = [],
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new ApiError(401, "No autorizado"));
    }

    const userRoles: string[] = Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : [];
    const userPerms: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    const roleAllowed =
      requiredRoles.length === 0 ||
      requiredRoles.some((r) => userRoles.includes(r));
    const permissionAllowed =
      requiredPermissions.length === 0 ||
      requiredPermissions.some((p) => userPerms.includes(p));

    if (!roleAllowed || !permissionAllowed) {
      return next(new ApiError(403, "Permiso denegado"));
    }

    next();
  };
};
