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
  checkPermissions(["FAM_APO"]),
  familiaController.obtenerMisFamiliares,
);

// GET /api/v1/academico/familias/alumno/:alumnoId
// Administrador, directora o profesor ve los apoderados de un alumno específico
router.get(
  "/alumno/:alumnoId",
  checkJwt,
  checkPermissions(["SYS_ADMIN", "STF_DIR", "STF_PROF"]),
  validateAlumnoIdParam,
  runValidation,
  familiaController.obtenerFamiliaDelAlumno,
);

// GET /api/v1/academico/familias/:relacionId
router.get(
  "/:relacionId",
  checkJwt,
  checkPermissions(["SYS_ADMIN", "STF_DIR", "STF_PROF"]),
  validateRelacionId,
  runValidation,
  familiaController.obtenerRelacion,
);

// POST /api/v1/academico/familias
// Vincula un apoderado a un alumno — ejecutado al momento del registro del apoderado
router.post(
  "/",
  checkJwt,
  checkPermissions(["SYS_ADMIN", "FAM_APO"]),
  validateVincularApoderado,
  runValidation,
  familiaController.vincularApoderadoAlumno,
);

// PUT /api/v1/academico/familias/:relacionId
router.put(
  "/:relacionId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateActualizarRelacion,
  runValidation,
  familiaController.actualizarRelacion,
);

// DELETE /api/v1/academico/familias/:relacionId
router.delete(
  "/:relacionId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateRelacionId,
  runValidation,
  familiaController.desvincularRelacion,
);

export default router;
