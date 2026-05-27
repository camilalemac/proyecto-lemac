import { body, param } from "express-validator";

export const validateCrearNivel = [
  body("NOMBRE")
    .trim()
    .notEmpty()
    .withMessage("El nombre del nivel es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),

  body("NOMBRE_CORTO")
    .trim()
    .notEmpty()
    .withMessage("El nombre corto del nivel es requerido")
    .isLength({ max: 20 })
    .withMessage("El nombre corto no puede superar los 20 caracteres"),

  body("GRADO_MINEDUC")
    .notEmpty()
    .withMessage("El grado MINEDUC es requerido")
    .isInt({ min: 1 })
    .withMessage("El grado MINEDUC debe ser un número entero positivo"),
];

export const validateActualizarNivel = [
  param("nivelId")
    .isInt({ min: 1 })
    .withMessage("El ID del nivel debe ser un número entero positivo"),

  body("NOMBRE")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre del nivel no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),

  body("NOMBRE_CORTO")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre corto no puede estar vacío")
    .isLength({ max: 20 })
    .withMessage("El nombre corto no puede superar los 20 caracteres"),

  body("GRADO_MINEDUC")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El grado MINEDUC debe ser un número entero positivo"),
];

export const validateNivelId = [
  param("nivelId")
    .isInt({ min: 1 })
    .withMessage("El ID del nivel debe ser un número entero positivo"),
];
