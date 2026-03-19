import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";
import "dotenv/config";

const app = express();

// 1. Configuración de base (Sin express.json() aquí para evitar conflictos con el proxy)
app.use(helmet());
app.use(cors());

const services: { [key: string]: string } = {
  auth: process.env.MS_AUTH_URL || "http://localhost:3001",
  identity: process.env.MS_IDENTITY_URL || "http://localhost:3003",
  geo: process.env.MS_GEO_URL || "http://localhost:3000",
  academico: process.env.MS_ACADEMICO_URL || "http://localhost:3004",
  pagos: process.env.MS_PAGOS_URL || "http://localhost:3005",
  documentos: process.env.MS_DOCUMENTOS_URL || "http://localhost:3006", // Asegúrate de que este puerto sea el correcto
};

// 2. Configuración de Proxies (Ordenados y Limpios)
Object.entries(services).forEach(([name, target]) => {
  const context = `/api/v1/${name}`;

  app.use(
    context,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path) => path, // Mantiene la URL intacta (/api/v1/geo/regiones llega igual al micro)
      on: {
        proxyReq: fixRequestBody,
        error: (err, req, res: any) => {
          logger.error(`[GATEWAY] Error en proxy ${name}:`, err);
          res
            .status(502)
            .json({ success: false, message: `${name} service unavailable` });
        },
      },
    }),
  );
});

// 3. Middlewares locales (Solo se ejecutan si la petición NO entró a un proxy)
app.use(express.json());
app.use("/health", (_req, res) => res.status(200).json({ status: "UP" }));
app.use(errorHandler);

export default app;
