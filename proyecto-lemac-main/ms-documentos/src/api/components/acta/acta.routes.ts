import { Router } from "express";
import * as actaController from "./acta.controller";
import { validateGenerarActa, validateListarActas } from "./acta.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/",
  checkJwt,
  checkPermissions(["secretario", "tesorero", "presidente", "directora", "administrador"]),
  validateListarActas,
  runValidation,
  actaController.listarActas,
);
router.post(
  "/generar",
  checkJwt,
  checkPermissions(["secretario", "administrador"]),
  validateGenerarActa,
  runValidation,
  actaController.generarActa,
);

export default router;
