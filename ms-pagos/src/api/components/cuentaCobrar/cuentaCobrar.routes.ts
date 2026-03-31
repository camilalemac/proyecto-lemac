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
  checkPermissions(["alumno", "apoderado"]),
  cuentaCobrarController.listarMisCobros,
);
router.get(
  "/mis-cobros/resumen",
  checkJwt,
  checkPermissions(["alumno", "apoderado"]),
  cuentaCobrarController.resumenMisCobros,
);

// RUTA MASIVA PROTEGIDA Y VALIDADA
router.post(
  "/curso/masivo",
  checkJwt as any,
  checkPermissions(["administrador", "tesorero", "directora"]) as any,
  validateCobroMasivo, // AGREGAMOS EL VALIDADOR AQUÍ
  runValidation, // VERIFICA LOS ERRORES DEL VALIDADOR
  cuentaCobrarController.generarCobroMasivoPorCurso as any,
);

router.get(
  "/alumno/:alumnoId",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "profesor", "directora", "presidente"]),
  validateAlumnoId,
  runValidation,
  cuentaCobrarController.listarCobrosPorAlumno,
);
router.get(
  "/alumno/:alumnoId/resumen",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "profesor", "directora", "presidente"]),
  validateResumen,
  runValidation,
  cuentaCobrarController.resumenCobrosPorAlumno,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "tesorero"]),
  validateCrearCobro,
  runValidation,
  cuentaCobrarController.crearCobro,
);
router.delete(
  "/:cobroId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCobroId,
  runValidation,
  cuentaCobrarController.eliminarCobro,
);

export default router;
