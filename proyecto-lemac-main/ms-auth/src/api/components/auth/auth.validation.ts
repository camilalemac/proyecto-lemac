import { body } from 'express-validator';

export const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password debe tener al menos 8 caracteres'),
];

export const validateRegister = [
  body('colegioId').isInt({ gt: 0 }).withMessage('colegioId inválido'),
  body('rutCuerpo').isString().notEmpty(),
  body('rutDv').isString().notEmpty(),
  body('nombres').isString().notEmpty(),
  body('apellidos').isString().notEmpty(),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password debe tener al menos 8 caracteres'),
];

export const validateRefresh = [
  body('refreshToken').isString().notEmpty().withMessage('refreshToken es requerido'),
];
