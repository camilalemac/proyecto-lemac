import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { errorHandler } from './src/api/middlewares/errorHandler.middleware';
import { logger } from './src/utils/logger';
import geoRoutes from './src/api/components/geo.routes';

const app: Application = express();

// ==========================================
// 1. MIDDLEWARES DE SEGURIDAD (ISO 27001 - A.10 / A.12)
// ==========================================
app.use(helmet()); // Oculta cabeceras de Express y protege contra vulnerabilidades web comunes
app.use(cors()); // Habilita Cross-Origin Resource Sharing
app.use(express.json({ limit: '1mb' })); // Previene ataques de payload gigante
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/geo', geoRoutes);
// Rate Limiting: Previene ataques de fuerza bruta y denegación de servicio (DDoS)
const rateLimiter = new RateLimiterMemory({
  points: 20, // Máximo 20 peticiones
  duration: 1, // Por segundo, por IP
});

app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip || 'unknown')
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit excedido para la IP: ${req.ip}`);
      res
        .status(429)
        .json({ success: false, message: 'Demasiadas solicitudes, intente más tarde.' });
    });
});

// Middleware de auditoría HTTP básico
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`Incoming request: [${req.method}] ${req.url}`);
  next();
});

// ==========================================
// 2. RUTAS (Healthcheck)
// ==========================================
// Endpoint básico para que el Gateway sepa que el microservicio está vivo
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: 'ms-geo', status: 'UP' });
});

// Aquí inyectaremos las rutas de 'geo' más adelante

// ==========================================
// 3. MANEJO CENTRALIZADO DE ERRORES
// ==========================================
// Debe ser el último middleware en ser inyectado
app.use(errorHandler);

export default app;
