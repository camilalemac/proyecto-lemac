import { body, param, query } from "express-validator";

export const validateCrearCobro = [
  body("ALUMNO_ID")
    .notEmpty()
    .withMessage("El ID del alumno es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("CONCEPTO_ID")
    .notEmpty()
    .withMessage("El ID del concepto es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("NUMERO_CUOTA")
    .notEmpty()
    .withMessage("El número de cuota es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("TOTAL_CUOTAS")
    .notEmpty()
    .withMessage("El total de cuotas es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("MONTO_ORIGINAL")
    .notEmpty()
    .withMessage("El monto original es requerido")
    .isFloat({ min: 0 })
    .withMessage("No puede ser negativo"),
  body("FECHA_VENCIMIENTO")
    .notEmpty()
    .withMessage("La fecha de vencimiento es requerida")
    .isISO8601()
    .withMessage("Debe tener formato ISO 8601 (YYYY-MM-DD)"),
  body("GRUPO_FAMILIAR_ID")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("APODERADO_ID")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("DESCRIPCION")
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage("La descripción no puede superar 255 caracteres"),
];

export const validateCobroId = [
  param("cobroId").isInt({ min: 1 }).withMessage("El ID del cobro debe ser un entero positivo"),
];

export const validateAlumnoId = [
  param("alumnoId").isInt({ min: 1 }).withMessage("El ID del alumno debe ser un entero positivo"),
];

export const validateResumen = [
  param("alumnoId").isInt({ min: 1 }).withMessage("El ID del alumno debe ser un entero positivo"),
  query("metodoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del método debe ser un entero positivo"),
];
