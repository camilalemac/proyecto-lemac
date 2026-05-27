import { body, param } from "express-validator";

export const validateCrearCuenta = [
  body("CURSO_ID")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un entero positivo"),
  body("NOMBRE_CUENTA")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la cuenta es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar 100 caracteres"),
  body("BANCO")
    .trim()
    .notEmpty()
    .withMessage("El nombre del banco es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre del banco no puede superar 100 caracteres"),
];

export const validateAbrirCaja = [
  body("cuentaOrigenId")
    .notEmpty()
    .withMessage("La cuenta de origen es requerida")
    .isInt({ min: 1 })
    .withMessage("El ID de cuenta origen debe ser un entero positivo"),
  body("cuentaDestinoId")
    .notEmpty()
    .withMessage("La cuenta de destino es requerida")
    .isInt({ min: 1 })
    .withMessage("El ID de cuenta destino debe ser un entero positivo"),
];

export const validateCuentaId = [
  param("cuentaId").isInt({ min: 1 }).withMessage("El ID de cuenta debe ser un entero positivo"),
];
