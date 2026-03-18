import { Router } from "express";
import * as familiaController from "./familia.controller";
import {
  validateVincularApoderado,
  validateActualizarRelacion,
  validateRelacionId,
  validateAlumnoIdParam,
} from "./familia.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/academico/familias/mis-hijos
// El apoderado consulta sus cargas académicas vinculadas
router.get(
  "/mis-hijos",
  checkJwt,
  checkPermissions(["apoderado"]),
  familiaController.obtenerMisFamiliares,
);

// GET /api/v1/academico/familias/alumno/:alumnoId
// Administrador o profesor ve los apoderados de un alumno específico
router.get(
  "/alumno/:alumnoId",
  checkJwt,
  checkPermissions(["administrador", "directora", "profesor"]),
  validateAlumnoIdParam,
  runValidation,
  familiaController.obtenerFamiliaDelAlumno,
);

// GET /api/v1/academico/familias/:relacionId
router.get(
  "/:relacionId",
  checkJwt,
  checkPermissions(["administrador", "directora", "profesor"]),
  validateRelacionId,
  runValidation,
  familiaController.obtenerRelacion,
);

// POST /api/v1/academico/familias
// Vincula un apoderado a un alumno — ejecutado al momento del registro del apoderado
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "apoderado"]),
  validateVincularApoderado,
  runValidation,
  familiaController.vincularApoderadoAlumno,
);

// PUT /api/v1/academico/familias/:relacionId
router.put(
  "/:relacionId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarRelacion,
  runValidation,
  familiaController.actualizarRelacion,
);

// DELETE /api/v1/academico/familias/:relacionId
router.delete(
  "/:relacionId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateRelacionId,
  runValidation,
  familiaController.desvincularRelacion,
);

export default router;
