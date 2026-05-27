import { Router } from "express";
import { CentroPadresController } from "./movimientoCep.controller";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

/**
 * @route   GET /api/v1/centro-padres/resumen
 * @desc    Obtener el resumen financiero del Centro de Padres
 */
router.get(
  "/resumen",
  checkJwt as any,
  // 🚨 AJUSTA LOS ROLES AQUÍ SEGÚN LOS NOMBRES QUE USES EN LA BD PARA EL CEP
  checkPermissions(["administrador", "CEN_PRES_CAP", "CEN_TES_CAP", "CEN_SEC_CAP","STF_DIR"]) as any,
  CentroPadresController.getResumenHandler as any
);

/**
 * @route   GET /api/v1/centro-padres/movimientos
 * @desc    Obtener la lista de ingresos y egresos del Centro de Padres
 */
router.get(
  "/movimientos",
  checkJwt as any,
  checkPermissions(["administrador", "CEN_PRES_CAP", "CEN_TES_CAP", "CEN_SEC_CAP","STF_DIR"]) as any,
  CentroPadresController.getMovimientosHandler as any
);

/**
 * @route   POST /api/v1/centro-padres/movimientos
 * @desc    Registrar un nuevo movimiento (Gasto/Ingreso) del CEP
 */
router.post(
  "/movimientos",
  checkJwt as any,
  checkPermissions(["administrador", "CEN_TES_CAP","STF_DIR"]) as any,
  CentroPadresController.crearMovimientoHandler as any
);

export default router;