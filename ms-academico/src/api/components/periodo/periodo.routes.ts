import { Router } from "express";
import * as periodoController from "./periodo.controller";
import {
  validateCrearPeriodo,
  validateActualizarPeriodo,
  validatePeriodoId,
} from "./periodo.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET /api/v1/academico/periodos
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
  periodoController.listarPeriodos,
);

// GET /api/v1/academico/periodos/vigente
router.get(
  "/vigente",
  checkJwt,
  checkPermissions([
    "administrador",
    "directora",
    "profesor",
    "tesorero",
    "secretario",
    "presidente",
  ]),
  periodoController.obtenerPeriodoVigente,
);

// GET /api/v1/academico/periodos/:periodoId
router.get(
  "/:periodoId",
  checkJwt,
  checkPermissions([
    "administrador",
    "directora",
    "profesor",
    "tesorero",
    "secretario",
    "presidente",
  ]),
  validatePeriodoId,
  runValidation,
  periodoController.obtenerPeriodo,
);

// POST /api/v1/academico/periodos
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearPeriodo,
  runValidation,
  periodoController.crearPeriodo,
);

// PUT /api/v1/academico/periodos/:periodoId
router.put(
  "/:periodoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarPeriodo,
  runValidation,
  periodoController.actualizarPeriodo,
);

// DELETE /api/v1/academico/periodos/:periodoId
router.delete(
  "/:periodoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validatePeriodoId,
  runValidation,
  periodoController.eliminarPeriodo,
);

export default router;
