import "dotenv/config";
import path from "path";
import fs from "fs";
import { Sequelize } from "sequelize";
import { logger } from "../utils/logger";
// @ts-ignore
import oracledb from "oracledb";

const dialect = (process.env.DB_DIALECT || "oracle").toLowerCase();
const dbName = process.env.DB_NAME || "softwarepayescolar_pagos";
const dbUser = process.env.DB_USER || "system";
const dbPassword = process.env.DB_PASSWORD || "";

// Normalización de la ruta de la Wallet
const tnsAdminRaw =
  process.env.DB_WALLET_PATH || process.env.TNS_ADMIN || path.join(process.cwd(), "wallet");
const walletPath = path.isAbsolute(tnsAdminRaw)
  ? tnsAdminRaw
  : path.resolve(process.cwd(), tnsAdminRaw);

let selectedConnectString = process.env.DB_CONNECT_STRING || dbName;

if (dialect === "oracle") {
  const tnsFile = path.join(walletPath, "tnsnames.ora");
  const sqlnetFile = path.join(walletPath, "sqlnet.ora");

  if (!fs.existsSync(tnsFile)) {
    throw new Error(`❌ Oracle wallet no encontrada en: ${walletPath}. Revisa el archivo .env`);
  }

  if (fs.existsSync(sqlnetFile)) {
    try {
      const sqlnetContent = fs.readFileSync(sqlnetFile, "utf8");
      const standardizedPath = walletPath.replace(/\\/g, "/");
      const updatedContent = sqlnetContent.replace(
        /DIRECTORY\s*=\s*\"?[^")]*\"?/gi,
        `DIRECTORY="${standardizedPath}"`,
      );

      if (updatedContent !== sqlnetContent) {
        fs.writeFileSync(sqlnetFile, updatedContent, "utf8");
        logger.info(`[ms-pagos] sqlnet.ora actualizado con éxito.`);
      }
    } catch (e) {
      logger.warn("[ms-pagos] No se pudo escribir en sqlnet.ora, verifica permisos.");
    }
  }

  // Forzar el Modo Thick
  try {
    oracledb.initOracleClient({ configDir: walletPath });
    logger.info("✅ [ms-pagos] Oracle Client (Thick Mode) cargado correctamente.");
  } catch (err: any) {
    if (!err.message.includes("NJS-077")) {
      logger.error("❌ [ms-pagos] Error al inicializar oracledb:", err.message);
    }
  }

  process.env.TNS_ADMIN = walletPath;
}

const sequelizeOptions: any = {
  dialect: dialect,
  logging: (sql: string) => logger.debug(`[sequelize] ${sql}`),
  pool: { max: 5, min: 0, acquire: 60000, idle: 10000 },
};

if (dialect === "oracle") {
  sequelizeOptions.dialectOptions = {
    connectString: selectedConnectString,
  };
} else {
  sequelizeOptions.host = process.env.DB_HOST || "localhost";
  sequelizeOptions.port = Number(process.env.DB_PORT || 3306);
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

export default sequelize;
