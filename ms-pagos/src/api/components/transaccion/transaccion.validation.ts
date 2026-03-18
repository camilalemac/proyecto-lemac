import { body, param, query } from "express-validator";

export const validateIniciarPago = [
  body("cobrosIds")
    .isArray({ min: 1 })
    .withMessage("Debe enviar al menos un cobro")
    .custom((ids: unknown[]) => ids.every((id) => Number.isInteger(id) && (id as number) > 0))
    .withMessage("Todos los IDs de cobros deben ser enteros positivos"),
  body("metodoId")
    .notEmpty()
    .withMessage("El ID del método de pago es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("metodoPagoNombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del método de pago es requerido")
    .isIn(["WEBPAY", "KHIPU", "TRANSFERENCIA"])
    .withMessage("El método debe ser WEBPAY, KHIPU o TRANSFERENCIA"),
];

export const validateConfirmarManual = [
  param("transaccionId")
    .isInt({ min: 1 })
    .withMessage("El ID de transacción debe ser un entero positivo"),
];

export const validateTokenQuery = [
  query("token_ws").optional().isString().withMessage("El token debe ser una cadena de texto"),
  query("payment_id")
    .optional()
    .isString()
    .withMessage("El payment_id debe ser una cadena de texto"),
];
