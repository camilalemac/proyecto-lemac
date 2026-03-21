import { Router } from "express";
import * as matriculaController from "./matricula.controller";
import {
  validateCrearMatricula,
  validatePromoverAlumnos,
  validateMatriculaId,
  validateAlumnoId,
  validateCursoIdParam,
} from "./matricula.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/academico/matriculas/mi-matricula
// El alumno consulta su propia matrícula vigente
router.get(
  "/mi-matricula",
  checkJwt,
  checkPermissions(["ALU_REG"]), // Alumno regular
  matriculaController.obtenerMatriculaVigente,
);

// GET /api/v1/academico/matriculas/curso/:cursoId
// Profesor, directivos y directivas ven la lista de alumnos de un curso
router.get(
  "/curso/:cursoId",
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
  validateCursoIdParam,
  runValidation,
  matriculaController.listarAlumnosPorCurso,
);

// GET /api/v1/academico/matriculas/alumno/:alumnoId
// Historial de matrículas de un alumno (acceso administrativo y tesoreros)
router.get(
  "/alumno/:alumnoId",
  checkJwt,
  checkPermissions([
    "SYS_ADMIN",
    "STF_DIR",
    "STF_PROF",
    "DIR_TES_ALU",
    "DIR_TES_APO",
    "CEN_TES_CAL",
    "CEN_TES_CAP",
  ]),
  validateAlumnoId,
  runValidation,
  matriculaController.listarMatriculasPorAlumno,
);

// GET /api/v1/academico/matriculas/:matriculaId
router.get(
  "/:matriculaId",
  checkJwt,
  checkPermissions([
    "SYS_ADMIN",
    "STF_DIR",
    "STF_PROF",
    "DIR_TES_ALU",
    "DIR_TES_APO",
    "CEN_TES_CAL",
    "CEN_TES_CAP",
  ]),
  validateMatriculaId,
  runValidation,
  matriculaController.obtenerMatricula,
);

// POST /api/v1/academico/matriculas
router.post(
  "/",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateCrearMatricula,
  runValidation,
  matriculaController.crearMatricula,
);

// POST /api/v1/academico/matriculas/curso/:cursoId/promocion
// Solo el profesor jefe o administrador puede ejecutar la promoción
router.post(
  "/curso/:cursoId/promocion",
  checkJwt,
  checkPermissions(["STF_PROF", "SYS_ADMIN"]),
  validatePromoverAlumnos,
  runValidation,
  matriculaController.promoverAlumnos,
);

// PATCH /api/v1/academico/matriculas/:matriculaId/retiro
router.patch(
  "/:matriculaId/retiro",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]),
  validateMatriculaId,
  runValidation,
  matriculaController.retirarAlumno,
);

export default router;
