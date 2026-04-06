import { Router } from "express";
import { transaccionController } from "./transaccion.controller";

const router = Router();

// Obtener transacciones por colegio (Historial/Blockchain)
router.get("/colegio/:colegioId", transaccionController.obtenerPorColegio);

// Registrar un pago manual (Efectivo/Transferencia) ejecutado por tesorería
router.post("/manual", transaccionController.confirmarPagoManual);

export default router;
