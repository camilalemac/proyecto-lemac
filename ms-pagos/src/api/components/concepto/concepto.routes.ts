import { Router } from "express";
import * as conceptoController from "./concepto.controller";
import {
  validateCrearConcepto,
  validateActualizarConcepto,
  validateConceptoId,
} from "./concepto.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/activos",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR","FAM_APO", "ALU_REG","DIR_TES_ALU","DIR_SEC_APO","DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  conceptoController.listarConceptosActivos,
);
router.get(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR","DIR_TES_ALU","DIR_SEC_APO","DIR_SEC_ALU", "DIR_PRES_ALU" ,"CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  conceptoController.listarConceptos,
);
router.get(
  "/:conceptoId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR","DIR_TES_ALU","DIR_SEC_APO","DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateConceptoId,
  runValidation,
  conceptoController.obtenerConcepto,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR","DIR_TES_ALU","DIR_SEC_APO","DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateCrearConcepto,
  runValidation,
  conceptoController.crearConcepto,
);
router.put(
  "/:conceptoId",
  checkJwt,
  checkPermissions(["administrador","STF_DIR"]),
  validateActualizarConcepto,
  runValidation,
  conceptoController.actualizarConcepto,
);
router.delete(
  "/:conceptoId",
  checkJwt,
  checkPermissions(["administrador","STF_DIR"]),
  validateConceptoId,
  runValidation,
  conceptoController.eliminarConcepto,
);

export default router;
