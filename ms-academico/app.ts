import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

import academicRoutes from "./src/api/routes";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 1. Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[ms-academico] Incoming request: [${req.method}] ${req.url}`);
  next();
});

// 2. Rutas
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: "ms-academico", status: "UP" });
});
app.use("/api/v1/academico", academicRoutes);

// 3. Manejo de Errores
app.use(errorHandler);

export default app;
