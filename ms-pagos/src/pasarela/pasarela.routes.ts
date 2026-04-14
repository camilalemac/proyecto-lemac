import { Router } from "express";
import { iniciarPagoMercadoPago, getConfiguracionBono } from "./pasarela.controller";

const router = Router();

router.get("/configuracion-bono", getConfiguracionBono);

// POST /api/v1/pasarela/iniciar-mercadopago
router.post("/iniciar-mercadopago", iniciarPagoMercadoPago);


export default router;
