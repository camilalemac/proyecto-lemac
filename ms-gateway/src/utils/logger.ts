import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, splat, colorize } = format;

const customFormat = printf(({ level, message, timestamp, ...meta }) => {
  const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${timestamp} [${level}] ${message} ${extra}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(colorize(), timestamp(), splat(), customFormat),
  transports: [new transports.Console()],
});
