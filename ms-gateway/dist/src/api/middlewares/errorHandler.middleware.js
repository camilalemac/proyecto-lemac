"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (logger) => {
    return (error, _req, res, _next) => {
        const status = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        logger.error("Gateway Error", {
            status,
            message,
            stack: error.stack,
            details: error,
            path: _req.path,
            method: _req.method,
        });
        res.status(status).json({ success: false, message });
    };
};
exports.errorHandler = errorHandler;
