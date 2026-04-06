  import express from "express";
  import cors from "cors";
  import helmet from "helmet";
  import rateLimit from "express-rate-limit";
  import routes from "./src/api/routes";
  import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
  import { logger } from "./src/utils/logger";

  import "dotenv/config";

  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 1. Rate Limit (Vital para un servicio de Auth)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // 2. Rutas
  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, service: "ms-auth", status: "UP" });
  });
  app.use("/api/v1/auth", routes);

  // 3. Manejo de Errores
  app.use(errorHandler);

  export default app;
