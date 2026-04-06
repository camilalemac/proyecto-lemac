import { body } from "express-validator";

export const validatePagosPendientes = [
  body("destinatario").isEmail().withMessage("Email del destinatario inválido"),
  body("nombreApoderado").trim().notEmpty().withMessage("El nombre del apoderado es requerido"),
  body("nombreAlumno").trim().notEmpty().withMessage("El nombre del alumno es requerido"),
  body("cuotas").isArray({ min: 1 }).withMessage("Debe incluir al menos una cuota pendiente"),
  body("totalPendiente")
    .isFloat({ min: 0 })
    .withMessage("El total pendiente debe ser un número positivo"),
];

export const validateConfirmacionPago = [
  body("destinatario").isEmail().withMessage("Email del destinatario inválido"),
  body("nombreApoderado").trim().notEmpty().withMessage("El nombre del apoderado es requerido"),
  body("monto").isFloat({ min: 0 }).withMessage("El monto debe ser un número positivo"),
  body("metodoPago").trim().notEmpty().withMessage("El método de pago es requerido"),
  body("fecha").trim().notEmpty().withMessage("La fecha es requerida"),
  body("cobros").isArray({ min: 1 }).withMessage("Debe incluir al menos un cobro"),
];

export const validateRecuperacionClave = [
  body("destinatario").isEmail().withMessage("Email del destinatario inválido"),
  body("nombreUsuario").trim().notEmpty().withMessage("El nombre del usuario es requerido"),
  body("enlaceRecuperacion")
    .trim()
    .notEmpty()
    .isURL()
    .withMessage("El enlace de recuperación debe ser una URL válida"),
];
