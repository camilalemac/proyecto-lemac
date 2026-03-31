import { Router } from "express";
import { webhookMercadoPago } from "./webhook.controller";

const router = Router();

// Esta ruta será la que le pasaremos a MercadoPago en el Adapter:
// POST /api/v1/webhooks/mercadopago
router.post("/mercadopago", webhookMercadoPago);

export default router;
