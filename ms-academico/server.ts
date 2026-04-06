import "dotenv/config";
import app from "./app";
import sequelize from "./src/config/database.config";
import { logger } from "./src/utils/logger";

// Importar todos los modelos para registrarlos en Sequelize antes de conectar
import "./src/models/index";

const PORT = Number(process.env.PORT) || 3004;

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("[ms-academico] Conexión a la base de datos establecida correctamente");

    app.listen(PORT, () => {
      logger.info(`[ms-academico] Servidor corriendo en puerto ${PORT}`);
      logger.info(`[ms-academico] Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error("[ms-academico] No se pudo conectar a la base de datos", { err });
    process.exit(1);
  }
};

// Manejo de señales de cierre para shutdown limpio
process.on("SIGTERM", async () => {
  logger.info("[ms-academico] SIGTERM recibido, cerrando servidor...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("[ms-academico] SIGINT recibido, cerrando servidor...");
  await sequelize.close();
  process.exit(0);
});

void startServer();
