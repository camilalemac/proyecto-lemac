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
    logger.warn("[ms-documentos] Error operacional", {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
    });
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  logger.error("[ms-documentos] Error no controlado", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Error interno del servidor" : err.message,
  });
};
