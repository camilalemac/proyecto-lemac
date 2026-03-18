import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import { errorHandler } from "./src/api/middlewares/errorHandler.middleware";
import { logger } from "./src/utils/logger";

import "dotenv/config";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.info("[ms-gateway] Incoming request", {
    method: req.method,
    path: req.path,
  });
  next();
});

const msAuthUrl = process.env.MS_AUTH_URL || "http://localhost:3001";
const msGeoUrl = process.env.MS_GEO_URL || "http://localhost:3002";
const msIdentityUrl = process.env.MS_IDENTITY_URL || "http://localhost:3003";

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, service: "ms-gateway", status: "UP" });
});

const authProxy = createProxyMiddleware({
  target: msAuthUrl,
  changeOrigin: true,
  pathRewrite: { "^/api/v1/auth": "/api/v1/auth" },
}) as any;

authProxy.on("error", (err: any, req: any, res: any) => {
  logger.error("Proxy auth error", { err, url: req.url });
  res.status(502).json({ success: false, message: "Auth service unavailable" });
});

app.use("/api/v1/auth", authProxy);

const geoProxy = createProxyMiddleware({
  target: msGeoUrl,
  changeOrigin: true,
  pathRewrite: { "^/api/v1/geo": "/api/v1/geo" },
}) as any;

geoProxy.on("error", (err: any, req: any, res: any) => {
  logger.error("Proxy geo error", { err, url: req.url });
  res.status(502).json({ success: false, message: "Geo service unavailable" });
});

app.use("/api/v1/geo", geoProxy);

const identityProxy = createProxyMiddleware({
  target: msIdentityUrl,
  changeOrigin: true,
  pathRewrite: { "^/api/v1/identity": "/api/v1/identity" },
}) as any;

identityProxy.on("error", (err: any, req: any, res: any) => {
  logger.error("Proxy identity error", { err, url: req.url });
  res
    .status(502)
    .json({ success: false, message: "Identity service unavailable" });
});

app.use("/api/v1/identity", identityProxy);

app.use(errorHandler(logger));

export default app;
