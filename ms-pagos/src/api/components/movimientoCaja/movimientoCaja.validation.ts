import { body, param } from "express-validator";

export const validateRegistrarMovimiento = [
  body("CUENTA_ID")
    .notEmpty()
    .withMessage("El ID de cuenta es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("CATEGORIA_ID")
    .notEmpty()
    .withMessage("El ID de categoría es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("TIPO_MOVIMIENTO")
    .notEmpty()
    .withMessage("El tipo de movimiento es requerido")
    .isIn(["INGRESO", "EGRESO"])
    .withMessage("Debe ser INGRESO o EGRESO"),
  body("GLOSA")
    .trim()
    .notEmpty()
    .withMessage("La glosa es requerida")
    .isLength({ max: 255 })
    .withMessage("La glosa no puede superar 255 caracteres"),
  body("MONTO")
    .notEmpty()
    .withMessage("El monto es requerido")
    .isFloat({ min: 0.01 })
    .withMessage("El monto debe ser mayor a 0"),
  body("FECHA_MOVIMIENTO")
    .notEmpty()
    .withMessage("La fecha del movimiento es requerida")
    .isISO8601()
    .withMessage("Debe tener formato ISO 8601"),
  body("COMPROBANTE_URL")
    .optional({ nullable: true })
    .isURL()
    .withMessage("La URL del comprobante no es válida"),
];

export const validateMovimientoId = [
  param("movimientoId")
    .isInt({ min: 1 })
    .withMessage("El ID del movimiento debe ser un entero positivo"),
];

export const validateCuentaId = [
  param("cuentaId").isInt({ min: 1 }).withMessage("El ID de cuenta debe ser un entero positivo"),
];
