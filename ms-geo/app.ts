import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { errorHandler } from './src/api/middlewares/errorHandler.middleware';
import { logger } from './src/utils/logger';
import geoRoutes from './src/api/components/geo.routes';

const app: Application = express();

// 1. Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Auditoría y Logs (Primero para rastrear todo)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`Incoming request: [${req.method}] ${req.url}`);
  next();
});

// 3. Rate Limiting
const rateLimiter = new RateLimiterMemory({ points: 20, duration: 1 });
app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip || 'unknown')
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit excedido para la IP: ${req.ip}`);
      res.status(429).json({ success: false, message: 'Demasiadas solicitudes.' });
    });
});

// 4. Rutas
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: 'ms-geo', status: 'UP' });
});

// Esta es la ruta que te daba 404 en las pruebas del Gateway
app.use('/api/v1/geo', geoRoutes);

// 5. Manejo Centralizado de Errores (ULTIMO)
app.use(errorHandler);

export default app;
