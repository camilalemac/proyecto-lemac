import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

// Interfaz para estructurar los errores de la API
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction, // Express requiere que la firma tenga 4 parámetros para detectarlo como Error Handler
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Registrar el error en el sistema de auditoría
  logger.error(`[${req.method}] ${req.originalUrl} - Status: ${statusCode} - Message: ${message}`);
  if (statusCode === 500) {
    logger.error(err.stack);
  }

  // Respuesta de seguridad: En producción, nunca enviamos el stack trace (A.14)
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Error interno del servidor. Por favor, contacte a soporte.'
        : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
