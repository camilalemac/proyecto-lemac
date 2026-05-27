import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno estrictamente antes de importar cualquier otra cosa
dotenv.config();

// ==========================================
// 1. AUTO-CONFIGURACIÓN DE ORACLE WALLET
// ==========================================
const walletDir = process.env.WALLET_DIR_NAME || 'wallet';
const absoluteWalletPath = path.resolve(process.cwd(), walletDir);

// Le decimos a los drivers de Oracle dónde buscar la Wallet
process.env.TNS_ADMIN = absoluteWalletPath;

// Calculamos la ruta física del archivo sqlnet.ora
const sqlnetPath = path.join(absoluteWalletPath, 'sqlnet.ora');

try {
  // Aseguramos que las barras sean compatibles con Oracle (convierte las \ de Windows a /)
  const oracleSafePath = absoluteWalletPath.replace(/\\/g, '/');

  // Generamos el contenido estricto que exige Oracle
  const sqlnetContent = `WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="${oracleSafePath}")))\nSSL_SERVER_DN_MATCH=yes`;

  // Sobrescribimos el archivo físicamente en tiempo de ejecución
  fs.writeFileSync(sqlnetPath, sqlnetContent, { encoding: 'utf8' });
  console.log(`[Seguridad] sqlnet.ora auto-configurado con éxito -> ${oracleSafePath}`);
} catch (error) {
  console.error(`[Error] Fallo crítico al auto-configurar el sqlnet.ora:`, error);
}

console.log(`[Seguridad] Variable de entorno inyectada (TNS_ADMIN): ${process.env.TNS_ADMIN}`);

// ==========================================
// 2. IMPORTACIONES DE LA APP (Deben ir después de configurar Oracle)
// ==========================================
import app from './app';
import sequelize from './src/config/database.config';
import { logger } from './src/utils/logger';

const PORT = process.env.PORT || 3000;

const startGeo = async () => {
  try {
    logger.info('[ms-geo] Iniciando microservicio');
    logger.info(`[ms-geo] Conectando a BD (${process.env.DB_NAME || 'sin DB_NAME'}) ...`);

    await sequelize.authenticate();
    logger.info('[ms-geo] Conexión a BD exitosa');

    await sequelize.sync();
    logger.info('[ms-geo] Sincronización de modelos completada');

    const server = app.listen(PORT, () => {
      logger.info(`ms-geo running on port ${PORT}`);
      console.log('[ms-geo] Servicio lanzado con éxito');
    });

    process.on('unhandledRejection', (err: any) => {
      logger.error('[ms-geo] UnhandledRejection', { err });
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err: any) => {
      logger.error('[ms-geo] UncaughtException', { err });
      process.exit(1);
    });
  } catch (error) {
    logger.error('[ms-geo] Error al iniciar servicio', { error });
    console.error('[ms-geo] Error al iniciar servicio', error);
    process.exit(1);
  }
};

startGeo();

// ==========================================
// 3. INTERCEPTORES DE FALLAS CRÍTICAS
// ==========================================
// Evita que el proceso caiga sin dejar rastro en los logs
process.on('unhandledRejection', (err: Error) => {
  logger.error('¡Unhandled Rejection! Apagando servidor de forma segura...');
  logger.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: Error) => {
  logger.error('¡Uncaught Exception! Apagando servidor de forma inmediata...');
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});
