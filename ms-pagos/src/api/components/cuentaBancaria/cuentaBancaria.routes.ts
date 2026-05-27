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
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR", "DIR_SEC_ALU"]),
  cuentaBancariaController.listarCuentas,
);
router.get(
  "/:cuentaId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR", "DIR_SEC_ALU"]),
  validateCuentaId,
  runValidation,
  cuentaBancariaController.obtenerCuenta,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR", "DIR_SEC_ALU"]),
  validateCrearCuenta,
  runValidation,
  cuentaBancariaController.crearCuenta,
);
router.post(
  "/apertura-caja",
  checkJwt,
  checkPermissions(["DIR_TES_APO", "administrador","STF_DIR"]),
  validateAbrirCaja,
  runValidation,
  cuentaBancariaController.abrirCaja,
);
router.put(
  "/:cuentaId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "STF_DIR"]),
  validateCuentaId,
  runValidation,
  cuentaBancariaController.actualizarCuenta,
);
router.delete(
  "/:cuentaId",
  checkJwt,
  checkPermissions(["administrador","STF_DIR"]),
  validateCuentaId,
  runValidation,
  cuentaBancariaController.eliminarCuenta,
);

export default router;
