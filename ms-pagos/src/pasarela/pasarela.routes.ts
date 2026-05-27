import { Router } from "express";
import { procesarCheckout, recibirWebhook } from "../pasarela/mercadopago.controller";
import { checkJwt } from "../api/middlewares/checkJwt.middleware";

const router = Router();

// Ruta protegida para el Apoderado (Genera el link de pago)
router.post("/checkout/mercadopago", checkJwt, procesarCheckout);

// Ruta PÚBLICA para MercadoPago (Recibe las confirmaciones de pago)
router.post("/mercadopago/webhook", recibirWebhook);

export default router;