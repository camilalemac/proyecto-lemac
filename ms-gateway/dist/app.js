"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const errorHandler_middleware_1 = require("./src/api/middlewares/errorHandler.middleware");
const logger_1 = require("./src/utils/logger");
require("dotenv/config");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, _res, next) => {
    logger_1.logger.info("[ms-gateway] Incoming request", {
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
const authProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: msAuthUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/auth": "/api/v1/auth" },
});
authProxy.on("error", (err, req, res) => {
    logger_1.logger.error("Proxy auth error", { err, url: req.url });
    res.status(502).json({ success: false, message: "Auth service unavailable" });
});
app.use("/api/v1/auth", authProxy);
const geoProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: msGeoUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/geo": "/api/v1/geo" },
});
geoProxy.on("error", (err, req, res) => {
    logger_1.logger.error("Proxy geo error", { err, url: req.url });
    res.status(502).json({ success: false, message: "Geo service unavailable" });
});
app.use("/api/v1/geo", geoProxy);
const identityProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: msIdentityUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/identity": "/api/v1/identity" },
});
identityProxy.on("error", (err, req, res) => {
    logger_1.logger.error("Proxy identity error", { err, url: req.url });
    res.status(502).json({ success: false, message: "Identity service unavailable" });
});
app.use("/api/v1/identity", identityProxy);
app.use((0, errorHandler_middleware_1.errorHandler)(logger_1.logger));
exports.default = app;
