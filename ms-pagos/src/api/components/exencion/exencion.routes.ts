import { Router } from "express";
import * as exencionController from "./exencion.controller";
import {
  validateSolicitarExencion,
  validateRevision,
  validateExencionId,
} from "./exencion.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "STF_DIR", "STF_PROF"]),
  exencionController.listarExenciones,
);
router.get(
  "/pendientes",
  checkJwt,
  checkPermissions(["STF_PROF", "DIR_TES_APO", "administrador","STF_DIR"]),
  exencionController.listarPendientes,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["STF_PROF", "DIR_TES_APO", "administrador", "FAM_APO","STF_DIR"]),
  validateSolicitarExencion,
  runValidation,
  exencionController.solicitarExencion,
);
router.patch(
  "/:exencionId/revision-profesor",
  checkJwt,
  checkPermissions(["STF_PROF", "DIR_TES_APO", "administrador", "FAM_APO","STF_DIR"]),
  validateRevision,
  runValidation,
  exencionController.revisarComoProfesor,
);
router.patch(
  "/:exencionId/revision-tesorero",
  checkJwt,
  checkPermissions(["STF_PROF", "DIR_TES_APO", "administrador", "FAM_APO","STF_DIR"]),
  validateRevision,
  runValidation,
  exencionController.revisarComoTesorero,
);

export default router;
