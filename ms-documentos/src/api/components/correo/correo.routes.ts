import { Router } from "express";
import * as correoController from "./correo.controller";
import {
  validatePagosPendientes,
  validateConfirmacionPago,
  validateRecuperacionClave,
} from "./correo.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// POST /api/v1/notificaciones/correos/pagos-pendientes
router.post(
  "/pagos-pendientes",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  validatePagosPendientes,
  runValidation,
  correoController.enviarPagosPendientes,
);

// POST /api/v1/notificaciones/correos/confirmacion-pago
router.post(
  "/confirmacion-pago",
  checkJwt,
  checkPermissions(["tesorero", "administrador", "apoderado"]),
  validateConfirmacionPago,
  runValidation,
  correoController.enviarConfirmacionPago,
);

// POST /api/v1/notificaciones/correos/recuperacion-clave
// Sin checkJwt — el usuario no tiene sesión cuando recupera su clave
router.post(
  "/recuperacion-clave",
  validateRecuperacionClave,
  runValidation,
  correoController.enviarRecuperacionClave,
);

export default router;
