import { Router } from "express";
import { CentroAlumnosController } from "./movimientoCea.controller";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

/**
 * @route   GET /api/v1/centro-alumnos/resumen
 * @desc    Obtener el resumen financiero del Centro de Alumnos
 */
router.get(
  "/resumen",
  checkJwt as any,
  checkPermissions(["administrador", "CEN_PRES_CAL", "CEN_TES_CAL","STF_DIR"]) as any,
  CentroAlumnosController.getResumenHandler as any
);

/**
 * @route   GET /api/v1/centro-alumnos/movimientos
 * @desc    Obtener la lista de ingresos y egresos del Centro de Alumnos
 */
router.get(
  "/movimientos",
  checkJwt as any,
  checkPermissions(["administrador", "CEN_PRES_CAL", "CEN_TES_CAL","STF_DIR"]) as any,
  CentroAlumnosController.getMovimientosHandler as any
);

/**
 * @route   POST /api/v1/centro-alumnos/movimientos
 * @desc    Registrar un nuevo movimiento (Gasto/Ingreso) del CEA
 * @note    🚨 Esta es la ruta que te estaba faltando o no estaba guardada
 */
router.post(
  "/movimientos",
  checkJwt as any,
  checkPermissions(["administrador", "CEN_TES_CAL","STF_DIR"]) as any,
  CentroAlumnosController.crearMovimientoHandler as any
);

export default router;