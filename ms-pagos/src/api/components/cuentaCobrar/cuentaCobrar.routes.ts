import { Router } from "express";
import * as cuentaCobrarController from "./cuentaCobrar.controller";
import {
  validateCrearCobro,
  validateCobroId,
  validateAlumnoId,
  validateResumen,
} from "./cuentaCobrar.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// Alumno y apoderado ven sus propias cuotas
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

// Vista administrativa por alumno
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
