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

// 1. RUTAS ESTÁTICAS PRIMERO (¡Muy importante para evitar conflictos!)
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

// NUESTRA NUEVA RUTA: POST /api/v1/pagos/cuentas-cobrar/curso/masivo
// POST /api/v1/pagos/cuentas-cobrar/curso/masivo
router.post(
  "/curso/masivo",
  checkJwt as any,
  // Cambiamos los nombres por los que tu sistema reconoce (UserRole)
  checkPermissions(["administrador", "tesorero", "directora"]) as any,
  cuentaCobrarController.generarCobroMasivoPorCurso as any,
);

// 2. RUTAS DINÁMICAS DESPUÉS (las que tienen :id)
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
