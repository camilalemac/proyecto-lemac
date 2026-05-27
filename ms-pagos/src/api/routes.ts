import { Router } from "express";
import categoriaRoutes from "./components/categoria/categoria.routes";
import metodoPagoRoutes from "./components/metodoPago/metodoPago.routes";
import conceptoRoutes from "./components/concepto/concepto.routes";
import cuentaBancariaRoutes from "./components/cuentaBancaria/cuentaBancaria.routes";
import cuentaCobrarRoutes from "./components/cuentaCobrar/cuentaCobrar.routes";
import movimientoCajaRoutes from "./components/movimientoCaja/movimientoCaja.routes";
import exencionRoutes from "./components/exencion/exencion.routes";
import movimientoCeaRouter from "./components/movimientoCea/movimientoCea.routes";
import aperturaCajaRoutes from "./components/apertura/aperturaCaja.routes";
import pasarelaRoutes from "../pasarela/pasarela.routes";
import movimientoCepRoutes from "./components/movimientoCep/movimientoCep.routes";

const router = Router();


router.use("/categorias", categoriaRoutes);
router.use("/metodos-pago", metodoPagoRoutes);
router.use("/conceptos", conceptoRoutes);
router.use("/cuentas-bancarias", cuentaBancariaRoutes);
router.use("/cobros", cuentaCobrarRoutes);
router.use("/movimientos-caja", movimientoCajaRoutes);
router.use("/exenciones", exencionRoutes);
router.use("/movimientoCea", movimientoCeaRouter);
router.use("/apertura", aperturaCajaRoutes);
router.use("/pasarela", pasarelaRoutes);
router.use("/movimientoCep", movimientoCepRoutes);

export default router;