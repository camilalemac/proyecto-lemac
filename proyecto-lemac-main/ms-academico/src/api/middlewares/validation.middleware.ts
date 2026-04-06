import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../../utils/ApiError";

/**
 * Middleware que evalúa el resultado de las validaciones de express-validator.
 * Debe colocarse siempre después de los validators y antes del controller.
 */
export const runValidation = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const mensajes = errors
      .array()
      .map((e) => e.msg as string)
      .join(", ");

    return next(ApiError.badRequest(mensajes));
  }

  next();
};
