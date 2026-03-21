import { Router } from "express";
import * as movimientoCajaController from "./movimientoCaja.controller";
import {
  validateRegistrarMovimiento,
  validateMovimientoId,
  validateCuentaId,
} from "./movimientoCaja.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/cuenta/:cuentaId",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "presidente", "directora"]),
  validateCuentaId,
  runValidation,
  movimientoCajaController.listarMovimientos,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  validateRegistrarMovimiento,
  runValidation,
  movimientoCajaController.registrarMovimiento,
);
router.delete(
  "/:movimientoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateMovimientoId,
  runValidation,
  movimientoCajaController.eliminarMovimiento,
);

export default router;
