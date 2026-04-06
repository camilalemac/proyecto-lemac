import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { UserRole } from "../../types/user.types";

export interface JwtPayload {
  userId: number;
  colegioId: number;
  role: UserRole;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const checkJwt = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token faltante"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("[ms-academico] JWT_SECRET no está definido en las variables de entorno");
      return next(new ApiError(500, "Error de configuración del servidor"));
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Token expirado"));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Token inválido"));
    }
    logger.error("[ms-academico] Error inesperado al verificar JWT", { err });
    return next(new ApiError(500, "Error interno del servidor"));
  }
};
