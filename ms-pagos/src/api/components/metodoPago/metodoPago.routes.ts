import { Router } from "express";
import * as metodoPagoController from "./metodoPago.controller";
import {
  validateCrearMetodo,
  validateActualizarMetodo,
  validateMetodoId,
  validateCotizacion,
} from "./metodoPago.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/pagos/metodos-pago/activos — apoderado elige método antes de pagar
router.get(
  "/activos",
  checkJwt,
  checkPermissions(["apoderado", "administrador", "tesorero"]),
  metodoPagoController.listarMetodosActivos,
);

// GET /api/v1/pagos/metodos-pago/cotizar?monto=X&metodoId=Y — muestra IVA y recargos antes de pagar
router.get(
  "/cotizar",
  checkJwt,
  checkPermissions(["apoderado", "administrador", "tesorero"]),
  validateCotizacion,
  runValidation,
  metodoPagoController.cotizarPago,
);

router.get("/", checkJwt, checkPermissions(["administrador"]), metodoPagoController.listarMetodos);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearMetodo,
  runValidation,
  metodoPagoController.crearMetodo,
);
router.put(
  "/:metodoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarMetodo,
  runValidation,
  metodoPagoController.actualizarMetodo,
);
router.delete(
  "/:metodoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateMetodoId,
  runValidation,
  metodoPagoController.eliminarMetodo,
);

export default router;
