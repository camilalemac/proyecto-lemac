import { Router } from "express";
import * as cursoController from "./curso.controller";
import {
  validateCrearCurso,
  validateActualizarCurso,
  validateAsignarProfesorJefe,
  validateCursoId,
  validateListarCursos,
} from "./curso.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/academico/cursos
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
  validateListarCursos,
  runValidation,
  cursoController.listarCursos,
);

// GET /api/v1/academico/cursos/mi-curso
// Permite al profesor jefe consultar el curso que le fue asignado
router.get("/mi-curso", checkJwt, checkPermissions(["STF_PROF"]), cursoController.obtenerMiCurso);

// GET /api/v1/academico/cursos/:cursoId
router.get(
  "/:cursoId",
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
  validateCursoId,
  runValidation,
  cursoController.obtenerCurso,
);

// POST /api/v1/academico/cursos
router.post(
  "/",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateCrearCurso,
  runValidation,
  cursoController.crearCurso,
);

// PATCH /api/v1/academico/cursos/:cursoId/profesor-jefe
router.patch(
  "/:cursoId/profesor-jefe",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateAsignarProfesorJefe,
  runValidation,
  cursoController.asignarProfesorJefe,
);

// PUT /api/v1/academico/cursos/:cursoId
router.put(
  "/:cursoId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateActualizarCurso,
  runValidation,
  cursoController.actualizarCurso,
);

// DELETE /api/v1/academico/cursos/:cursoId
router.delete(
  "/:cursoId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateCursoId,
  runValidation,
  cursoController.eliminarCurso,
);

export default router;
