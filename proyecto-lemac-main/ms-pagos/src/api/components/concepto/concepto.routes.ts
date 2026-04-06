import { Router } from "express";
import * as conceptoController from "./concepto.controller";
import {
  validateCrearConcepto,
  validateActualizarConcepto,
  validateConceptoId,
} from "./concepto.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/activos",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "presidente", "directora", "apoderado", "alumno"]),
  conceptoController.listarConceptosActivos,
);
router.get(
  "/",
  checkJwt,
  checkPermissions(["administrador", "tesorero"]),
  conceptoController.listarConceptos,
);
router.get(
  "/:conceptoId",
  checkJwt,
  checkPermissions(["administrador", "tesorero"]),
  validateConceptoId,
  runValidation,
  conceptoController.obtenerConcepto,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearConcepto,
  runValidation,
  conceptoController.crearConcepto,
);
router.put(
  "/:conceptoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarConcepto,
  runValidation,
  conceptoController.actualizarConcepto,
);
router.delete(
  "/:conceptoId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateConceptoId,
  runValidation,
  conceptoController.eliminarConcepto,
);

export default router;
