"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const { combine, timestamp, printf, splat, colorize } = winston_1.format;
const customFormat = printf(({ level, message, timestamp, ...meta }) => {
    const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level}] ${message} ${extra}`;
});
exports.logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(colorize(), timestamp(), splat(), customFormat),
    transports: [new winston_1.transports.Console()],
});
