import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { RateLimiterMemory } from "rate-limiter-flexible";
import pagosRoutes from "./src/api/routes";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";

const app: Application = express();

// 1. Middlewares de configuración y seguridad
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 2. Logging (Debe ir arriba para registrar TODO lo que entra)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[ms-pagos] Incoming request: [${req.method}] ${req.url}`);
  next();
});

// 3. Rate Limiting (Debe ir antes de las rutas para protegerlas)
const rateLimiter = new RateLimiterMemory({ points: 20, duration: 1 });
app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip || "unknown")
    .then(() => next())
    .catch(() => {
      logger.warn(`[ms-pagos] Rate limit excedido para IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Demasiadas solicitudes." });
    });
});

// 4. Rutas
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: "ms-pagos", status: "UP" });
});
app.use("/api/v1/pagos", pagosRoutes);

// 5. Manejo de Errores (SIEMPRE AL FINAL)
app.use(errorHandler);

export default app;
