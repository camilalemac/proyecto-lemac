import { Router } from "express";
import authRoutes from "./components/auth/auth.routes";

const router = Router();

router.use("/", authRoutes);

export default router;
