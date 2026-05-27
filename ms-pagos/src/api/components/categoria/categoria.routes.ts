import { Router } from "express";
import * as categoriaController from "./categoria.controller";
import {
  validateCrearCategoria,
  validateActualizarCategoria,
  validateCategoriaId,
} from "./categoria.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.get(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR","DIR_TES_ALU","DIR_SEC_APO","DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL", "CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  categoriaController.listarCategorias,
);
router.get(
  "/:categoriaId",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_APO", "DIR_PRES_APO", "STF_DIR","DIR_TES_ALU","DIR_SEC_APO","DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"]),
  validateCategoriaId,
  runValidation,
  categoriaController.obtenerCategoria,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador", "DIR_TES_ALU","DIR_SEC_ALU", "DIR_PRES_ALU", "CEN_PRES_CAL", "CEN_TES_CAL", "CEN_SEC_CAL","CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP","STF_DIR"]),
  validateCrearCategoria,
  runValidation,
  categoriaController.crearCategoria,
);
router.put(
  "/:categoriaId",
  checkJwt,
  checkPermissions(["administrador","STF_DIR"]),
  validateActualizarCategoria,
  runValidation,
  categoriaController.actualizarCategoria,
);
router.delete(
  "/:categoriaId",
  checkJwt,
  checkPermissions(["administrador","STF_DIR"]),
  validateCategoriaId,
  runValidation,
  categoriaController.eliminarCategoria,
);

export default router;
