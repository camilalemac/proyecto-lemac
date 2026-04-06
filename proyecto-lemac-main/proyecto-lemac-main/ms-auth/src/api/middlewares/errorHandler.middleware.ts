import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    logger.error(err.message, { stack: err.stack });
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  logger.error('Internal Server Error', { error: err });
  return res.status(500).json({ success: false, message: 'Internal Server Error' });
};
