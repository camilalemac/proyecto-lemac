import { body, param } from "express-validator";

const TIPOS_COBRO_VALIDOS = ["MENSUAL", "ANUAL", "BONO", "EXTRAORDINARIO"];

export const validateCrearConcepto = [
  body("CATEGORIA_ID")
    .notEmpty()
    .withMessage("La categoría es requerida")
    .isInt({ min: 1 })
    .withMessage("El ID de categoría debe ser un entero positivo"),
  body("CUENTA_DESTINO_ID")
    .notEmpty()
    .withMessage("La cuenta destino es requerida")
    .isInt({ min: 1 })
    .withMessage("El ID de cuenta destino debe ser un entero positivo"),
  body("CODIGO")
    .trim()
    .notEmpty()
    .withMessage("El código es requerido")
    .isLength({ max: 20 })
    .withMessage("El código no puede superar 20 caracteres"),
  body("NOMBRE")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar 100 caracteres"),
  body("MONTO_BASE")
    .notEmpty()
    .withMessage("El monto base es requerido")
    .isFloat({ min: 0 })
    .withMessage("El monto base no puede ser negativo"),
  body("TIPO_COBRO")
    .notEmpty()
    .withMessage("El tipo de cobro es requerido")
    .isIn(TIPOS_COBRO_VALIDOS)
    .withMessage(`El tipo de cobro debe ser: ${TIPOS_COBRO_VALIDOS.join(", ")}`),
];

export const validateActualizarConcepto = [
  param("conceptoId")
    .isInt({ min: 1 })
    .withMessage("El ID del concepto debe ser un entero positivo"),
  body("NOMBRE")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar 100 caracteres"),
  body("MONTO_BASE")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto base no puede ser negativo"),
  body("TIPO_COBRO")
    .optional()
    .isIn(TIPOS_COBRO_VALIDOS)
    .withMessage(`El tipo de cobro debe ser: ${TIPOS_COBRO_VALIDOS.join(", ")}`),
  body("ACTIVO").optional().isBoolean().withMessage("ACTIVO debe ser un valor booleano"),
];

export const validateConceptoId = [
  param("conceptoId")
    .isInt({ min: 1 })
    .withMessage("El ID del concepto debe ser un entero positivo"),
];
