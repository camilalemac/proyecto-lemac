import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';

export const checkPermissions = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return next(new ApiError(401, 'No autorizado'));
    if (!allowedRoles.includes(user.role)) {
      return next(new ApiError(403, 'Permiso denegado'));
    }
    next();
  };
};
