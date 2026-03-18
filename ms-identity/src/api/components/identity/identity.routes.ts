import { Router } from "express";
import * as identityController from "./identity.controller";
import {
  validateRegister,
  validateLogin,
  validateRefresh,
} from "./identity.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.post(
  "/register",
  validateRegister,
  runValidation,
  identityController.register,
);
router.post("/login", validateLogin, runValidation, identityController.login);
router.post(
  "/refresh",
  validateRefresh,
  runValidation,
  identityController.refresh,
);
router.post("/logout", checkJwt, identityController.logout);
router.get("/me", checkJwt, identityController.me);

// Funcionalidades de cuotas y gastos
router.get(
  "/cuotas",
  checkJwt,
  checkPermissions([
    "alumno",
    "apoderado",
    "profesor",
    "tesorero",
    "presidente",
    "directora",
    "administrador",
  ]),
  identityController.getCuotas,
);
router.get(
  "/gastos",
  checkJwt,
  checkPermissions([
    "alumno",
    "apoderado",
    "profesor",
    "tesorero",
    "presidente",
    "directora",
    "administrador",
  ]),
  identityController.getGastosPorCategoria,
);

// Funcionalidades de pago y grupo familiar
router.post(
  "/pagos/bono-cooperacion",
  checkJwt,
  checkPermissions(["apoderado", "tesorero", "presidente", "administrador"]),
  identityController.pagarBonoCooperacion,
);
router.post(
  "/pagos/cuotas",
  checkJwt,
  checkPermissions(["apoderado", "tesorero", "presidente", "administrador"]),
  identityController.pagarCuotas,
);
router.get(
  "/grupo-familiar",
  checkJwt,
  checkPermissions(["apoderado", "administrador"]),
  identityController.getGrupoFamiliar,
);

// Funcionalidades profesor
router.get(
  "/curso/alumnos",
  checkJwt,
  checkPermissions(["profesor", "tesorero", "presidente", "administrador"]),
  identityController.getAlumnosCurso,
);
router.post(
  "/curso/promocion",
  checkJwt,
  checkPermissions(["profesor", "administrador"]),
  identityController.promoverAlumnos,
);
router.post(
  "/curso/exencion",
  checkJwt,
  checkPermissions(["profesor", "tesorero", "administrador"]),
  identityController.exencionPagos,
);
router.post(
  "/curso/validar-cuenta-alumno",
  checkJwt,
  checkPermissions(["profesor", "administrador"]),
  identityController.validarCuentaAlumno,
);

// Funcionalidades centro/apoderados
router.post(
  "/reportes",
  checkJwt,
  checkPermissions(["tesorero", "presidente", "administrador"]),
  identityController.generarReportes,
);
router.post(
  "/cuentas",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  identityController.agregarCuentaPago,
);

export default router;
