import { body, param } from "express-validator";

export const validateSolicitarExencion = [
  body("COBRO_ID")
    .notEmpty()
    .withMessage("El ID del cobro es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("MOTIVO")
    .trim()
    .notEmpty()
    .withMessage("El motivo de la exención es requerido")
    .isLength({ min: 10, max: 500 })
    .withMessage("El motivo debe tener entre 10 y 500 caracteres"),
];

export const validateRevision = [
  param("exencionId")
    .isInt({ min: 1 })
    .withMessage("El ID de la exención debe ser un entero positivo"),
  body("aprobado")
    .notEmpty()
    .withMessage("Debe indicar si aprueba o rechaza")
    .isBoolean()
    .withMessage("Debe ser un valor booleano"),
  body("observacion")
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage("La observación no puede superar 500 caracteres"),
];

export const validateExencionId = [
  param("exencionId")
    .isInt({ min: 1 })
    .withMessage("El ID de la exención debe ser un entero positivo"),
];
