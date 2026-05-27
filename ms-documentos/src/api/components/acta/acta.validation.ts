import { body, query } from "express-validator";

export const validateGenerarActa = [
  body("titulo").trim().notEmpty().withMessage("El título del acta es requerido"),
  body("colegio").trim().notEmpty().withMessage("El nombre del colegio es requerido"),
  body("fecha")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isISO8601()
    .withMessage("La fecha debe tener formato ISO 8601"),
  body("lugar").trim().notEmpty().withMessage("El lugar de la reunión es requerido"),
  body("asistentes").isArray({ min: 1 }).withMessage("Debe incluir al menos un asistente"),
  body("contenido")
    .trim()
    .notEmpty()
    .withMessage("El contenido del acta es requerido")
    .isLength({ min: 10 })
    .withMessage("El contenido debe tener al menos 10 caracteres"),
  body("generadoPor").trim().notEmpty().withMessage("El nombre del secretario es requerido"),
];

export const validateListarActas = [
  query("cursoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un entero positivo"),
];
