import { Router } from "express";
import * as transaccionController from "./transaccion.controller";
import { validateIniciarPago, validateConfirmarManual } from "./transaccion.validation";
import { runValidation } from "../../middlewares/validation.middleware";
import { checkJwt } from "../../middlewares/checkJwt.middleware";
import { checkPermissions } from "../../middlewares/checkPermissions.middleware";

const router = Router();

router.post(
  "/iniciar",
  checkJwt,
  checkPermissions(["apoderado", "administrador", "tesorero"]),
  validateIniciarPago,
  runValidation,
  transaccionController.iniciarPago,
);
router.get("/webpay/retorno", transaccionController.retornoWebpay);
router.post("/webpay/retorno", transaccionController.retornoWebpay);
router.get("/khipu/retorno", transaccionController.retornoKhipu);
router.get("/khipu/cancelado", transaccionController.canceladoKhipu);
router.post(
  "/confirmar-transferencia",
  checkJwt,
  checkPermissions(["tesorero", "administrador"]),
  validateConfirmarManual,
  runValidation,
  transaccionController.confirmarTransferenciaManual,
);

export default router;
