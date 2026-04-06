import { Router } from "express";
import categoriaRoutes from "./components/categoria/categoria.routes";
import metodoPagoRoutes from "./components/metodoPago/metodoPago.routes";
import conceptoRoutes from "./components/concepto/concepto.routes";
import cuentaBancariaRoutes from "./components/cuentaBancaria/cuentaBancaria.routes";
import cuentaCobrarRoutes from "./components/cuentaCobrar/cuentaCobrar.routes";
import movimientoCajaRoutes from "./components/movimientoCaja/movimientoCaja.routes";
import exencionRoutes from "./components/exencion/exencion.routes";
import transaccionRoutes from "./components/transaccion/transaccion.routes";

const router = Router();

router.use("/categorias", categoriaRoutes);
router.use("/metodos-pago", metodoPagoRoutes);
router.use("/conceptos", conceptoRoutes);
router.use("/cuentas-bancarias", cuentaBancariaRoutes);
router.use("/cobros", cuentaCobrarRoutes);
router.use("/movimientos-caja", movimientoCajaRoutes);
router.use("/exenciones", exencionRoutes);
router.use("/transacciones", transaccionRoutes);

export default router;
