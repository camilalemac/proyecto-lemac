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
  checkPermissions(["administrador", "tesorero", "presidente", "directora"]),
  categoriaController.listarCategorias,
);
router.get(
  "/:categoriaId",
  checkJwt,
  checkPermissions(["administrador", "tesorero", "presidente", "directora"]),
  validateCategoriaId,
  runValidation,
  categoriaController.obtenerCategoria,
);
router.post(
  "/",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCrearCategoria,
  runValidation,
  categoriaController.crearCategoria,
);
router.put(
  "/:categoriaId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateActualizarCategoria,
  runValidation,
  categoriaController.actualizarCategoria,
);
router.delete(
  "/:categoriaId",
  checkJwt,
  checkPermissions(["administrador"]),
  validateCategoriaId,
  runValidation,
  categoriaController.eliminarCategoria,
);

export default router;
