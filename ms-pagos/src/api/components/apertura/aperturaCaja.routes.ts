import { Router } from "express";
import * as aperturaCajaController from "./aperturaCaja.controller";
import { validateRegistrarApertura, validateObtenerApertura } from "./aperturaCaja.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

// GET: /api/v1/apertura/curso/:cursoId?periodoAnio=2026
router.get(
  "/curso/:cursoId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "STF_DIR", "STF_PROF"]),
  validateObtenerApertura,
  runValidation,
  aperturaCajaController.obtenerAperturaCaja,
);

// POST: /api/v1/apertura
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "FAM_APO", "STF_PROF","STF_DIR"]),
  validateRegistrarApertura,
  runValidation,
  aperturaCajaController.registrarAperturaCaja,
);

export default router;