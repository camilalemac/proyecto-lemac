import dotenv from "dotenv";

dotenv.config();

import path from "path";
import fs from "fs";
import app from "./app";
import sequelize from "./src/config/database.config";
import "./src/models";
import { logger } from "./src/utils/logger";

const walletDir = process.env.WALLET_DIR_NAME || "wallet";
const tnsAdminRaw = process.env.TNS_ADMIN || walletDir;
const projectRoot = path.resolve(__dirname);
const absoluteWalletPath = path.isAbsolute(tnsAdminRaw)
  ? tnsAdminRaw
  : path.resolve(projectRoot, tnsAdminRaw);

// si DB_DIALECT es oracle, validamos carpetas y generamos sqlnet.ora si no existe.
if ((process.env.DB_DIALECT || "oracle").toLowerCase() === "oracle") {
  if (!fs.existsSync(absoluteWalletPath)) {
    console.error(
      `[Error][ms-auth] Wallet Oracle no encontrado: ${absoluteWalletPath}.`,
    );
    process.exit(1);
  }

  process.env.TNS_ADMIN = absoluteWalletPath;

  const sqlnetPath = path.join(absoluteWalletPath, "sqlnet.ora");
  const oracleSafePath = absoluteWalletPath.replace(/\\/g, "/");
  const sqlnetContent = `WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="${oracleSafePath}")))\nSSL_SERVER_DN_MATCH=yes`;

  try {
    fs.writeFileSync(sqlnetPath, sqlnetContent, { encoding: "utf8" });
    console.log(
      `[Seguridad][ms-auth] sqlnet.ora auto-configurado con éxito -> ${oracleSafePath}`,
    );
  } catch (error) {
    console.error(
      "[Error][ms-auth] Fallo crítico al auto-configurar sqlnet.ora:",
      error,
    );
    process.exit(1);
  }

  console.log(
    `[Seguridad][ms-auth] Variable de entorno inyectada (TNS_ADMIN): ${process.env.TNS_ADMIN}`,
  );
} else {
  console.log(
    "[Seguridad][ms-auth] DB_DIALECT no es oracle; se omite configuración de TNS_ADMIN.",
  );
}

const PORT = Number(process.env.PORT || 3001);

const startServer = async () => {
  try {
    logger.info("Iniciando ms-auth");
    logger.info(
      `Intentando conectar a la DB (dialect=${process.env.DB_DIALECT || "oracle"})`,
    );

    await sequelize.authenticate();
    logger.info("Conexión con la BD establecida con éxito");

    await sequelize.sync();
    logger.info("Sincronización de modelos realizada");

    app.listen(PORT, () => {
      logger.info(`ms-auth running on port ${PORT}`);
      console.log("[ms-auth] Servicio lanzado con éxito");
    });
  } catch (error) {
    const internalError =
      error instanceof Error ? error : new Error("Unknown startup error");
    logger.error("Failed to start server", {
      message: internalError.message,
      stack: internalError.stack,
      details: error,
    });

    // En ambientes de desarrollo, mostrar directamente en consola más info
    console.error("Failed to start server:", internalError);
    process.exit(1);
  }
};

startServer();
