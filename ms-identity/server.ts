import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import app from "./app";
import sequelize from "./src/config/database.config";
import "./src/models";
import { logger } from "./src/utils/logger";

dotenv.config();

const walletDir = process.env.WALLET_DIR_NAME || "wallet";
const tnsAdminRaw = process.env.TNS_ADMIN || walletDir;
const projectRoot = path.resolve(__dirname);
const absoluteWalletPath = path.isAbsolute(tnsAdminRaw)
  ? tnsAdminRaw
  : path.resolve(projectRoot, tnsAdminRaw);

if ((process.env.DB_DIALECT || "oracle").toLowerCase() === "oracle") {
  if (!fs.existsSync(absoluteWalletPath)) {
    console.error(
      `[Error][ms-identity] Wallet Oracle no encontrado: ${absoluteWalletPath}.`,
    );
    process.exit(1);
  }

  process.env.TNS_ADMIN = absoluteWalletPath;
}

const PORT = Number(process.env.PORT || 3003);

const startServer = async () => {
  try {
    logger.info("Iniciando ms-identity");
    logger.info(
      `Intentando conectar a la DB (dialect=${process.env.DB_DIALECT || "oracle"})`,
    );

    await sequelize.authenticate();
    logger.info("Conexión con la BD establecida con éxito");

    await sequelize.sync();
    logger.info("Sincronización de modelos realizada");

    app.listen(PORT, () => {
      logger.info(`ms-identity running on port ${PORT}`);
      console.log("[ms-identity] Servicio lanzado con éxito");
    });
  } catch (error) {
    const internalError =
      error instanceof Error ? error : new Error("Unknown startup error");
    logger.error("Failed to start server", {
      message: internalError.message,
      stack: internalError.stack,
      details: error,
    });
    console.error("Failed to start server:", internalError);
    process.exit(1);
  }
};

startServer();
