import { Router } from "express";
import correoRoutes from "./components/correo/correo.routes";
import reporteRoutes from "./components/reporte/reporte.routes";
import actaRoutes from "./components/acta/acta.routes";

const router = Router();

router.use("/correos", correoRoutes);
router.use("/reportes", reporteRoutes);
router.use("/actas", actaRoutes);

export default router;
