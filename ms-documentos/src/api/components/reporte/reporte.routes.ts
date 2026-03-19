import { Router } from "express";
import * as reporteController from "./reporte.controller";
import { validateGenerarReporte } from "./reporte.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// POST /api/v1/notificaciones/reportes/generar
router.post(
  "/generar",
  checkJwt,
  checkPermissions(["tesorero", "presidente", "directora", "administrador"]),
  validateGenerarReporte,
  runValidation,
  reporteController.generarReporte,
);

export default router;
