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
  checkPermissions(["alumno"]),
  matriculaController.obtenerMatriculaVigente,
);

// GET /api/v1/academico/matriculas/curso/:cursoId
// Profesor, tesorero y directivos ven la lista de alumnos de un curso
router.get(
  "/curso/:cursoId",
  checkJwt,
  checkPermissions([
    "administrador",
    "directora",
    "profesor",
    "tesorero",
    "secretario",
    "presidente",
  ]),
  validateCursoIdParam,
  runValidation,
  matriculaController.listarAlumnosPorCurso,
);

// GET /api/v1/academico/matriculas/alumno/:alumnoId
// Historial de matrículas de un alumno (acceso administrativo y del propio alumno)
router.get(
  "/alumno/:alumnoId",
  checkJwt,
  checkPermissions(["administrador", "directora", "profesor", "tesorero"]),
  validateAlumnoId,
  runValidation,
  matriculaController.listarMatriculasPorAlumno,
);

// GET /api/v1/academico/matriculas/:matriculaId
router.get(
  "/:matriculaId",
  checkJwt,
  checkPermissions(["administrador", "directora", "profesor", "tesorero"]),
  validateMatriculaId,
  runValidation,
  matriculaController.obtenerMatricula,
);

// POST /api/v1/academico/matriculas
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearMatricula,
  runValidation,
  matriculaController.crearMatricula,
);

// POST /api/v1/academico/matriculas/curso/:cursoId/promocion
// Solo el profesor jefe puede ejecutar la promoción de su curso
router.post(
  "/curso/:cursoId/promocion",
  checkJwt,
  checkPermissions(["profesor", "administrador"]),
  validatePromoverAlumnos,
  runValidation,
  matriculaController.promoverAlumnos,
);

// PATCH /api/v1/academico/matriculas/:matriculaId/retiro
router.patch(
  "/:matriculaId/retiro",
  checkJwt,
  checkPermissions(["administrador"]),
  validateMatriculaId,
  runValidation,
  matriculaController.retirarAlumno,
);

export default router;
