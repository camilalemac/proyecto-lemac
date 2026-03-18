import { Router } from "express";
import * as nivelController from "./nivel.controller";
import { validateCrearNivel, validateActualizarNivel, validateNivelId } from "./nivel.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/academico/niveles
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
  nivelController.listarNiveles,
);

// GET /api/v1/academico/niveles/:nivelId
router.get(
  "/:nivelId",
  checkJwt,
  checkPermissions([
    "administrador",
    "directora",
    "profesor",
    "tesorero",
    "secretario",
    "presidente",
  ]),
  validateNivelId,
  runValidation,
  nivelController.obtenerNivel,
);

// POST /api/v1/academico/niveles
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearNivel,
  runValidation,
  nivelController.crearNivel,
);

// PUT /api/v1/academico/niveles/:nivelId
router.put(
  "/:nivelId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarNivel,
  runValidation,
  nivelController.actualizarNivel,
);

// DELETE /api/v1/academico/niveles/:nivelId
router.delete(
  "/:nivelId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateNivelId,
  runValidation,
  nivelController.eliminarNivel,
);

export default router;
