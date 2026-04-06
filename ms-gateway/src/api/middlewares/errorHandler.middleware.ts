import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";

export const errorHandler = (logger: Logger) => {
  return (error: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    logger.error("Gateway Error", {
      status,
      message,
      stack: error.stack,
      details: error,
      path: _req.path,
      method: _req.method,
    });

    res.status(status).json({ success: false, message });
  };
};
