import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { UserRole } from "../../types/user.types";

export const checkPermissions = (rolesPermitidos: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Usuario no autenticado"));
    }

    const rolUsuario = req.user.role;
    const tieneAcceso = rolesPermitidos.includes(rolUsuario);

    if (!tieneAcceso) {
      logger.warn("[ms-pagos] Acceso denegado por rol insuficiente", {
        userId: req.user.userId,
        rolUsuario,
        rolesRequeridos: rolesPermitidos,
        path: req.path,
      });
      return next(new ApiError(403, "No tienes permisos para realizar esta acción"));
    }

    next();
  };
};
