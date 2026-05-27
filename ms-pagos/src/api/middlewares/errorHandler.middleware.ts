import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    logger.warn("[ms-pagos] Error operacional", {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  logger.error("[ms-pagos] Error no controlado", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Error interno del servidor" : err.message,
  });
};
