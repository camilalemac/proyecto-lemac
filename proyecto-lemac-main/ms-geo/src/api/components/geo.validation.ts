import { param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError';

// Middleware genérico para evaluar los resultados de express-validator
const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extraer solo los mensajes de error limpios
    const extractedErrors = errors
      .array()
      .map((err) => err.msg)
      .join('; ');
    // Lanzar un 400 Bad Request que será capturado por el errorHandler
    return next(new ApiError(400, `Error de validación: ${extractedErrors}`));
  }
  next();
};

export const validateGetProvincias = [
  param('idRegion')
    .exists()
    .withMessage('El parámetro idRegion es obligatorio.')
    .isInt({ min: 1 })
    .withMessage('El idRegion debe ser un número entero positivo.')
    .toInt(), // Sanitización: convierte el string a number de forma segura
  validate,
];

export const validateGetComunas = [
  param('idProvincia')
    .exists()
    .withMessage('El parámetro idProvincia es obligatorio.')
    .isInt({ min: 1 })
    .withMessage('El idProvincia debe ser un número entero positivo.')
    .toInt(),
  validate,
];
