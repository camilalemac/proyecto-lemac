import { Router } from "express";
import identityRoutes from "./components/identity/identity.routes";

const router = Router();

router.use("/", identityRoutes);

export default router;
