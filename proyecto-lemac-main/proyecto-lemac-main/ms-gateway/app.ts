import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";
import "dotenv/config";

const app = express();

app.use(helmet());
app.use(cors());

const services: { [key: string]: string } = {
  auth: process.env.MS_AUTH_URL || "http://localhost:3001",
  identity: process.env.MS_IDENTITY_URL || "http://localhost:3003",
  geo: process.env.MS_GEO_URL || "http://localhost:3005",
  academico: process.env.MS_ACADEMICO_URL || "http://localhost:3004",
  pagos: process.env.MS_PAGOS_URL || "http://localhost:3005",
  documentos: process.env.MS_DOCUMENTOS_URL || "http://localhost:3006",
};

// ==========================================
// 1. INSTANCIA ÚNICA DEL PROXY (Router Dinámico)
// ==========================================
const gatewayProxy = createProxyMiddleware({
  target: services.auth, // Destino fallback requerido por la librería
  router: (req) => {
    // EXTRAEMOS LA URL AQUÍ PARA SATISFACER A TYPESCRIPT
    const url = req.url || "";

    // El router decide el destino real basado en la URL
    if (url.startsWith("/api/v1/auth")) return services.auth;
    if (url.startsWith("/api/v1/geo")) return services.geo;
    if (url.startsWith("/api/v1/identity")) return services.identity;
    if (url.startsWith("/api/v1/academico")) return services.academico;
    if (url.startsWith("/api/v1/pagos")) return services.pagos;
    if (url.startsWith("/api/v1/documentos")) return services.documentos;
    return undefined;
  },
  changeOrigin: true,
  on: {
    proxyReq: fixRequestBody,
    error: (err, req, res: any) => {
      // También protegemos el req.url en el log de errores
      const url = req.url || "desconocida";
      logger.error(`[GATEWAY] Error de conexión en ruta ${url}:`, err);
      res.status(502).json({
        success: false,
        message: "Microservicio no disponible o apagado.",
      });
    },
  },
});
// ==========================================
// 2. INTERCEPTOR DE PETICIONES
// ==========================================
// Al evaluar la ruta aquí, Express NUNCA recorta el /api/v1/.
// La ruta viaja intacta al microservicio (ej: /api/v1/geo/regiones)
app.use((req, res, next) => {
  if (req.url.startsWith("/api/v1/")) {
    return gatewayProxy(req, res, next);
  }
  next();
});

// ==========================================
// 3. MIDDLEWARES LOCALES (Para rutas del Gateway)
// ==========================================
app.use(express.json());
app.use("/health", (_req, res) =>
  res.status(200).json({ status: "UP", service: "ms-gateway" }),
);
app.use(errorHandler(logger));

export default app;
