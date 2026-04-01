import "dotenv/config";
import app from "./app";
import sequelize from "./src/config/database.config";
import { logger } from "./src/utils/logger";
import "./src/models/index";

const PORT = Number(process.env.PORT) || 3005;

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("[ms-pagos] Conexión a la base de datos establecida correctamente");
    app.listen(PORT, () => {
      logger.info(`[ms-pagos] Servidor corriendo en puerto ${PORT}`);
      logger.info(`[ms-pagos] Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error("[ms-pagos] No se pudo conectar a la base de datos", { err });
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  logger.info("[ms-pagos] SIGTERM recibido, cerrando...");
  await sequelize.close();
  process.exit(0);
});
process.on("SIGINT", async () => {
  logger.info("[ms-pagos] SIGINT recibido, cerrando...");
  await sequelize.close();
  process.exit(0);
});

void startServer();
