import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./src/api/routes";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";

import "dotenv/config";

const app = express();

// 1. Configuración básica
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Limiter (Protección global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 3. Rutas
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, service: "ms-identity", status: "UP" });
});

// Aquí es donde recibes el "Usuario no encontrado" o "Token inválido"
app.use("/api/v1/identity", routes);

// 4. Manejo de Errores
app.use(errorHandler);

export default app;
