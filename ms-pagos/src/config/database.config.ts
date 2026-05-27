import "dotenv/config";
import path from "path";
import fs from "fs";
import { Sequelize } from "sequelize";
import oracledb from "oracledb";
import { logger } from "../utils/logger";

const dialect = (process.env.DB_DIALECT || "oracle").toLowerCase();
const dbName = process.env.DB_NAME || (dialect === "mysql" ? "test" : "softwarepayescolar_pagos");
const dbUser = process.env.DB_USER || (dialect === "mysql" ? "root" : "system");
const dbPassword = process.env.DB_PASSWORD || "";
const walletDir = process.env.WALLET_DIR_NAME || "wallet";
const tnsAdminRaw = process.env.TNS_ADMIN || walletDir;
const projectRoot = path.resolve(__dirname, "../../");
const walletPath = path.isAbsolute(tnsAdminRaw)
  ? tnsAdminRaw
  : path.resolve(projectRoot, tnsAdminRaw);

let selectedConnectString = process.env.DB_CONNECT_STRING || dbName;

if (dialect === "oracle") {
  const tnsFile = path.join(walletPath, "tnsnames.ora");
  if (!fs.existsSync(tnsFile)) {
    throw new Error(
      `Oracle wallet no encontrado: ${tnsFile}. Verifica WALLET_DIR_NAME o TNS_ADMIN.`,
    );
  }

  const tnsContent = fs.readFileSync(tnsFile, "utf8");
  const tnEntries = Array.from(
    new Set(
      (tnsContent.match(/^\s*([A-Za-z0-9_]+)\s*=/gm) || []).map((m) => m.replace(/\s*=\s*$/, "")),
    ),
  );

  const sqlnetFile = path.join(walletPath, "sqlnet.ora");
  if (fs.existsSync(sqlnetFile)) {
    const sqlnetContent = fs.readFileSync(sqlnetFile, "utf8");
    const normalizedWalletPath = walletPath.replace(/\\/g, "\\\\");
    const updatedSqlnetContent = sqlnetContent.replace(
      /DIRECTORY\s*=\s*\([^)]*\)/gi,
      `DIRECTORY=${normalizedWalletPath}`,
    );
    if (updatedSqlnetContent !== sqlnetContent) {
      fs.writeFileSync(sqlnetFile, updatedSqlnetContent, "utf8");
      logger.info(`[ms-pagos] sqlnet.ora actualizado con WALLET_LOCATION=${walletPath}`);
    }
  }

  if (!selectedConnectString || !tnEntries.includes(selectedConnectString)) {
    const auto = tnEntries[0];
    if (!auto) throw new Error("No se encontró ninguna entrada válida en tnsnames.ora");
    if (selectedConnectString) {
      logger.warn(
        `[ms-pagos] '${selectedConnectString}' no existe en tnsnames.ora, usando '${auto}'.`,
      );
    }
    selectedConnectString = auto;
  }

  process.env.TNS_ADMIN = walletPath;

  try {
    oracledb.initOracleClient({ libDir: undefined, configDir: walletPath });
  } catch (err) {
    logger.warn("[ms-pagos] oracledb.initOracleClient:", err);
  }
}

logger.info(`[ms-pagos] DB: dialect=${dialect}, name=${dbName}, user=${dbUser}`);

const sequelizeOptions: Record<string, unknown> = {
  dialect: dialect as "oracle" | "mysql",
  logging: (sql: string, timing?: number) => {
    logger.info(`[ms-pagos][sequelize] ${sql}${timing ? ` (${timing}ms)` : ""}`);
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

if (dialect === "oracle") {
  sequelizeOptions.dialectOptions = {
    connectString: selectedConnectString,
    walletLocation: walletPath,
    walletPassword: process.env.WALLET_PASSWORD || undefined,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 20000),
  };
} else if (dialect === "mysql") {
  sequelizeOptions.host = process.env.DB_HOST || "localhost";
  sequelizeOptions.port = Number(process.env.DB_PORT || 3306);
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

export default sequelize;
