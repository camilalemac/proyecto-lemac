import { Router } from "express";
import * as periodoController from "./periodo.controller";
import {
  validateCrearPeriodo,
  validateActualizarPeriodo,
  validatePeriodoId,
} from "./periodo.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/academico/periodos
router.get(
  "/",
  checkJwt,
  checkPermissions([
    "SYS_ADMIN",
    "STF_DIR",
    "STF_PROF",
    "DIR_PRES_ALU",
    "DIR_PRES_APO",
    "CEN_PRES_CAL",
    "CEN_PRES_CAP",
    "DIR_TES_ALU",
    "DIR_TES_APO",
    "CEN_TES_CAL",
    "CEN_TES_CAP",
    "DIR_SEC_ALU",
    "DIR_SEC_APO",
    "CEN_SEC_CAL",
    "CEN_SEC_CAP",
  ]),
  periodoController.listarPeriodos,
);

// GET /api/v1/academico/periodos/vigente
router.get(
  "/vigente",
  checkJwt,
  checkPermissions([
    "SYS_ADMIN",
    "STF_DIR",
    "STF_PROF",
    "DIR_PRES_ALU",
    "DIR_PRES_APO",
    "CEN_PRES_CAL",
    "CEN_PRES_CAP",
    "DIR_TES_ALU",
    "DIR_TES_APO",
    "CEN_TES_CAL",
    "CEN_TES_CAP",
    "DIR_SEC_ALU",
    "DIR_SEC_APO",
    "CEN_SEC_CAL",
    "CEN_SEC_CAP",
  ]),
  periodoController.obtenerPeriodoVigente,
);

// GET /api/v1/academico/periodos/:periodoId
router.get(
  "/:periodoId",
  checkJwt,
  checkPermissions([
    "SYS_ADMIN",
    "STF_DIR",
    "STF_PROF",
    "DIR_PRES_ALU",
    "DIR_PRES_APO",
    "CEN_PRES_CAL",
    "CEN_PRES_CAP",
    "DIR_TES_ALU",
    "DIR_TES_APO",
    "CEN_TES_CAL",
    "CEN_TES_CAP",
    "DIR_SEC_ALU",
    "DIR_SEC_APO",
    "CEN_SEC_CAL",
    "CEN_SEC_CAP",
  ]),
  validatePeriodoId,
  runValidation,
  periodoController.obtenerPeriodo,
);

// POST /api/v1/academico/periodos
router.post(
  "/",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateCrearPeriodo,
  runValidation,
  periodoController.crearPeriodo,
);

// PUT /api/v1/academico/periodos/:periodoId
router.put(
  "/:periodoId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateActualizarPeriodo,
  runValidation,
  periodoController.actualizarPeriodo,
);

// DELETE /api/v1/academico/periodos/:periodoId
router.delete(
  "/:periodoId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validatePeriodoId,
  runValidation,
  periodoController.eliminarPeriodo,
);

export default router;
