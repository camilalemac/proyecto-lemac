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
    "administrador",
    "directora",
    "profesor",
    "tesorero",
    "secretario",
    "presidente",
  ]),
  validateListarCursos,
  runValidation,
  cursoController.listarCursos,
);

// GET /api/v1/academico/cursos/mi-curso
// Permite al profesor jefe consultar el curso que le fue asignado
router.get("/mi-curso", checkJwt, checkPermissions(["profesor"]), cursoController.obtenerMiCurso);

// GET /api/v1/academico/cursos/:cursoId
router.get(
  "/:cursoId",
  checkJwt,
  checkPermissions([
    "administrador",
    "directora",
    "profesor",
    "tesorero",
    "secretario",
    "presidente",
  ]),
  validateCursoId,
  runValidation,
  cursoController.obtenerCurso,
);

// POST /api/v1/academico/cursos
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearCurso,
  runValidation,
  cursoController.crearCurso,
);

// PATCH /api/v1/academico/cursos/:cursoId/profesor-jefe
router.patch(
  "/:cursoId/profesor-jefe",
  checkJwt,
  checkPermissions(["administrador"]),
  validateAsignarProfesorJefe,
  runValidation,
  cursoController.asignarProfesorJefe,
);

// PUT /api/v1/academico/cursos/:cursoId
router.put(
  "/:cursoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarCurso,
  runValidation,
  cursoController.actualizarCurso,
);

// DELETE /api/v1/academico/cursos/:cursoId
router.delete(
  "/:cursoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCursoId,
  runValidation,
  cursoController.eliminarCurso,
);

export default router;
