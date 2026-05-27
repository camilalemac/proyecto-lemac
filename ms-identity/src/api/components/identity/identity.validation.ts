import { body, query } from "express-validator";

export const validateRegister = [
  body("email").isEmail().withMessage("Email válido requerido"),
  body("password").isLength({ min: 8 }).withMessage("Password mínimo 8 caracteres"),
  body("nombres").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío"),
  body("apellidos").optional().trim().notEmpty().withMessage("El apellido no puede estar vacío"),
  body("rutCuerpo").optional().trim().notEmpty().withMessage("El RUT no puede estar vacío"),
  body("rutDv")
    .optional()
    .trim()
    .isLength({ min: 1, max: 1 })
    .withMessage("El dígito verificador debe ser 1 caracter"),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Email válido requerido"),
  body("password").notEmpty().withMessage("Password requerido"),
];

export const validateRefresh = [
  body("refreshToken").notEmpty().withMessage("Refresh token es requerido"),
];

export const validateFindByRut = [
  query("rutCuerpo").notEmpty().withMessage("El cuerpo del RUT es requerido").trim(),
  query("rutDv")
    .notEmpty()
    .withMessage("El dígito verificador es requerido")
    .trim()
    .isLength({ min: 1, max: 1 })
    .withMessage("El dígito verificador debe ser 1 caracter"),
  body("comunaId")
    .notEmpty()
    .withMessage("La comuna es obligatoria")
    .isInt()
    .withMessage("El ID de comuna debe ser un número entero"),
  body("direccionCalle").notEmpty().withMessage("La dirección es obligatoria").trim(),
];
