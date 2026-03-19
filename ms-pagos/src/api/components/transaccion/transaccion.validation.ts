import { body } from "express-validator";

export const validateIniciarPago = [
  body("cobrosIds")
    .isArray({ min: 1 })
    .withMessage("Debe enviar al menos un cobro")
    .custom((ids: unknown[]) => ids.every((id) => Number.isInteger(id) && (id as number) > 0))
    .withMessage("Todos los IDs deben ser enteros positivos"),
  body("metodoId")
    .notEmpty()
    .withMessage("El ID del método de pago es requerido")
    .isInt({ min: 1 }),
  body("metodoPagoNombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del método es requerido")
    .isIn(["WEBPAY", "KHIPU", "TRANSFERENCIA"])
    .withMessage("Debe ser WEBPAY, KHIPU o TRANSFERENCIA"),
];

export const validateConfirmarManual = [
  body("cobrosIds").isArray({ min: 1 }).withMessage("Debe enviar al menos un cobro"),
];
