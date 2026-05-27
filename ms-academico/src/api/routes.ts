import { Router } from "express";
import nivelRoutes from "./components/nivel/nivel.routes";
import periodoRoutes from "./components/periodo/periodo.routes";
import cursoRoutes from "./components/curso/curso.routes";
import matriculaRoutes from "./components/matricula/matricula.routes";
import familiaRoutes from "./components/familia/familia.routes";

const router = Router();

router.use("/niveles", nivelRoutes);
router.use("/periodos", periodoRoutes);
router.use("/cursos", cursoRoutes);
router.use("/matriculas", matriculaRoutes);
router.use("/familias", familiaRoutes);

export default router;
