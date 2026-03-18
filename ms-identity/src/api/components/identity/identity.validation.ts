import { body } from "express-validator";

export const validateRegister = [
  body("email").isEmail().withMessage("Email válido requerido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password mínimo 8 caracteres"),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Email válido requerido"),
  body("password").notEmpty().withMessage("Password requerido"),
];

export const validateRefresh = [
  body("refreshToken").notEmpty().withMessage("Refresh token es requerido"),
];
