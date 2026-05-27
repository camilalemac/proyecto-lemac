import { Router } from "express";
import * as cuentaCobrarController from "./cuentaCobrar.controller";
import {
  validateCrearCobro,
  validateCobroId,
  validateAlumnoId,
  validateResumen,
  validateCobroMasivo, // IMPORTAMOS EL NUEVO VALIDADOR
} from "./cuentaCobrar.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/mis-cobros",
  checkJwt,
  checkPermissions(["ALU_REG", "FAM_APO", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_APO", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP","STF_DIR"]),
  cuentaCobrarController.listarMisCobros,
);
router.get(
  "/mis-cobros/resumen",
  checkJwt,
  checkPermissions(["ALU_REG", "FAM_APO", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_APO", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP","STF_DIR"]),
  cuentaCobrarController.resumenMisCobros,
);

// RUTA MASIVA PROTEGIDA Y VALIDADA
router.post(
  "/curso/masivo",
  checkJwt as any,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_PROF", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP","STF_DIR"]) as any,
  validateCobroMasivo,
  runValidation,
  cuentaCobrarController.generarCobroMasivoPorCurso as any,
);

router.get(
  "/alumno/:alumnoId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "STF_PROF", "STF_DIR", "DIR_PRES_APO", "FAM_APO", "ALU_REG", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateAlumnoId,
  runValidation,
  cuentaCobrarController.listarCobrosPorAlumno,
);
router.get(
  "/alumno/:alumnoId/resumen",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "STF_PROF", "STF_DIR", "DIR_PRES_APO", "FAM_APO", "ALU_REG", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateResumen,
  runValidation,
  cuentaCobrarController.resumenCobrosPorAlumno,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL", "CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateCrearCobro,
  runValidation,
  cuentaCobrarController.crearCobro,
);
router.delete(
  "/:cobroId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateCobroId,
  runValidation,
  cuentaCobrarController.eliminarCobro,
);

router.get(
  "/curso/:cursoId/resumen",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR", "STF_PROF", "DIR_TES_ALU", "DIR_SEC_APO", "DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  cuentaCobrarController.resumenCobrosPorCurso,
);

export default router;
