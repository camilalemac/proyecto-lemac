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
  checkPermissions(["administrador", "tesorero", "directora"]),
  exencionController.listarExenciones,
);
router.get(
  "/pendientes",
  checkJwt,
  checkPermissions(["profesor", "tesorero", "administrador"]),
  exencionController.listarPendientes,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  validateSolicitarExencion,
  runValidation,
  exencionController.solicitarExencion,
);
router.patch(
  "/:exencionId/revision-profesor",
  checkJwt,
  checkPermissions(["profesor", "administrador"]),
  validateRevision,
  runValidation,
  exencionController.revisarComoProfesor,
);
router.patch(
  "/:exencionId/revision-tesorero",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  validateRevision,
  runValidation,
  exencionController.revisarComoTesorero,
);

export default router;
