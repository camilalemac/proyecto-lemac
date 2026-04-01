import { Router } from "express";
import * as cuentaBancariaController from "./cuentaBancaria.controller";
import {
  validateCrearCuenta,
  validateAbrirCaja,
  validateCuentaId,
} from "./cuentaBancaria.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "presidente", "directora"]),
  cuentaBancariaController.listarCuentas,
);
router.get(
  "/:cuentaId",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "presidente", "directora"]),
  validateCuentaId,
  runValidation,
  cuentaBancariaController.obtenerCuenta,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "tesorero"]),
  validateCrearCuenta,
  runValidation,
  cuentaBancariaController.crearCuenta,
);
router.post(
  "/apertura-caja",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  validateAbrirCaja,
  runValidation,
  cuentaBancariaController.abrirCaja,
);
router.put(
  "/:cuentaId",
  checkJwt,
  checkPermissions(["administrador", "tesorero"]),
  validateCuentaId,
  runValidation,
  cuentaBancariaController.actualizarCuenta,
);
router.delete(
  "/:cuentaId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCuentaId,
  runValidation,
  cuentaBancariaController.eliminarCuenta,
);

export default router;
