import { Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { UserRole } from "../../types/user.types";
import { RequestWithUser } from "./checkJwt.middleware";

export const checkPermissions = (rolesPermitidos: UserRole[]) => {
  return (req: RequestWithUser, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new ApiError(401, "Usuario no autenticado"));
    const tieneAcceso = rolesPermitidos.includes(req.user.role);
    if (!tieneAcceso) {
      logger.warn("[ms-documentos] Acceso denegado", {
        userId: req.user.userId,
        role: req.user.role,
      });
      return next(new ApiError(403, "No tienes permisos para realizar esta acción"));
    }
    next();
  };
};
