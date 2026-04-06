  import { Router } from "express";
  import * as identityController from "./identity.controller";
  import {
    validateRegister,
    validateLogin,
    validateRefresh,
    validateFindByRut,
  } from "./identity.validation";
  import { runValidation } from "../../middlewares/validation.middleware";
  import { checkJwt } from "../../middlewares/checkJwt.middleware";

  const router = Router();

  // POST /api/v1/identity/register
  router.post("/register", validateRegister, runValidation, identityController.register);

  // POST /api/v1/identity/login
  router.post("/login", validateLogin, runValidation, identityController.login);

  // POST /api/v1/identity/refresh
  router.post("/refresh", validateRefresh, runValidation, identityController.refresh);

  // POST /api/v1/identity/logout
  router.post("/logout", checkJwt, identityController.logout);

  // GET /api/v1/identity/me
  router.get("/me", checkJwt, identityController.me);

  router.post("/", identityController.createUser);
  // GET /api/v1/identity/buscar-por-rut
  // Usado por ms-academico para vincular apoderado con alumno por RUT
  router.get(
    "/buscar-por-rut",
    checkJwt,
    validateFindByRut,
    runValidation,
    identityController.findByRut,
  );

  export default router;
