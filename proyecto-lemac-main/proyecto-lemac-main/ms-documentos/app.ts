import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { RateLimiterMemory } from "rate-limiter-flexible";
import documentosRoutes from "./src/api/routes";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";

const app: Application = express();

// 1. Configuración y Seguridad Base
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 2. Logger (Debe ir primero para registrar intentos de ataque)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[ms-documentos] Incoming request: [${req.method}] ${req.url}`);
  next();
});

// 3. Rate Limiting (Protección de recursos)
const rateLimiter = new RateLimiterMemory({ points: 20, duration: 1 });
app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip || "unknown")
    .then(() => next())
    .catch(() => {
      logger.warn(`[ms-documentos] Rate limit excedido para IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Demasiadas solicitudes." });
    });
});

// 4. Rutas
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: "ms-documentos", status: "UP" });
});
app.use("/api/v1/documentos", documentosRoutes);

// 5. Manejo de Errores (SIEMPRE AL FINAL)
app.use(errorHandler);

export default app;
