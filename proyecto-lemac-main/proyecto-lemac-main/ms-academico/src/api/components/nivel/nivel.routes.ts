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
    "SYS_ADMIN", // Administrador
    "STF_DIR", // Directora
    "STF_PROF", // Profesor
    "DIR_PRES_ALU",
    "DIR_PRES_APO",
    "CEN_PRES_CAL",
    "CEN_PRES_CAP", // Presidentes
    "DIR_TES_ALU",
    "DIR_TES_APO",
    "CEN_TES_CAL",
    "CEN_TES_CAP", // Tesoreros
    "DIR_SEC_ALU",
    "DIR_SEC_APO",
    "CEN_SEC_CAL",
    "CEN_SEC_CAP", // Secretarios
  ]),
  nivelController.listarNiveles,
);

// GET /api/v1/academico/niveles/:nivelId
router.get(
  "/:nivelId",
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
  validateNivelId,
  runValidation,
  nivelController.obtenerNivel,
);

// POST /api/v1/academico/niveles
router.post(
  "/",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]), // Solo el administrador crea
  validateCrearNivel,
  runValidation,
  nivelController.crearNivel,
);

// PUT /api/v1/academico/niveles/:nivelId
router.put(
  "/:nivelId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]), // Solo el administrador actualiza
  validateActualizarNivel,
  runValidation,
  nivelController.actualizarNivel,
);

// DELETE /api/v1/academico/niveles/:nivelId
router.delete(
  "/:nivelId",
  checkJwt,
  checkPermissions(["SYS_ADMIN"]), // Solo el administrador elimina
  validateNivelId,
  runValidation,
  nivelController.eliminarNivel,
);

export default router;
