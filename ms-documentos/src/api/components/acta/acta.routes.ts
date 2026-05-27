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
  checkPermissions(["secretario", "administrador", "DIR_SEC_APO"]),
  validateListarActas,
  runValidation,
  actaController.listarActas,
);
router.post(
  "/generar",
  checkJwt,
  checkPermissions(["secretario", "administrador", "DIR_SEC_APO"]),
  validateGenerarActa,
  runValidation,
  actaController.generarActa,
);

export default router;
