import { Router } from "express";
import { iniciarPagoMercadoPago } from "./pasarela.controller";

const router = Router();

// POST /api/v1/pasarela/iniciar-mercadopago
router.post("/iniciar-mercadopago", iniciarPagoMercadoPago);

export default router;
