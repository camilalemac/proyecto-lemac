import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../../utils/ApiError";

export const runValidation = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mensajes = errors
      .array()
      .map((e) => e.msg as string)
      .join(", ");
    return next(new ApiError(400, mensajes));
  }
  next();
};
