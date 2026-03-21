import "dotenv/config";
import path from "path";
import fs from "fs";
import { Sequelize } from "sequelize";
// @ts-ignore
import oracledb from "oracledb";

const dialect = (process.env.DB_DIALECT || "oracle").toLowerCase();
const dbName = process.env.DB_NAME || (dialect === "mysql" ? "test" : "softwarepayescolar_tp");
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
      `Oracle wallet no encontrado: ${tnsFile}. Asegúrate de que WALLET_DIR_NAME o TNS_ADMIN sea correcto.`,
    );
  }

  const tnsContent = fs.readFileSync(tnsFile, "utf8");
  const tnEntries = Array.from(
    new Set(
      (tnsContent.match(/^\s*([A-Za-z0-9_]+)\s*=/gm) || []).map((m) => m.replace(/\s*=\s*$/, "")),
    ),
  );

  if (!selectedConnectString || !tnEntries.includes(selectedConnectString)) {
    const auto = tnEntries[0];
    if (!auto) {
      throw new Error("No se encontró ninguna entrada válida en tnsnames.ora");
    }

    if (selectedConnectString) {
      console.warn(
        `Advertencia: '${selectedConnectString}' no existe en tnsnames.ora, usando '${auto}' en su lugar.`,
      );
    }

    selectedConnectString = auto;
  }

  process.env.TNS_ADMIN = walletPath;

  try {
    oracledb.initOracleClient({
      libDir: undefined,
      configDir: walletPath,
    });
  } catch (err) {
    // Normalmente oracledb puede fallar si ya está iniciado; ignoramos
  }
}

console.log("[ms-auth] Configuración DB:");
console.log(`  dialect: ${dialect}`);
console.log(`  dbName: ${dbName}`);
console.log(`  user: ${dbUser}`);
console.log(`  walletPath: ${walletPath}`);
console.log(`  selectedConnectString: ${selectedConnectString}`);

const sequelizeOptions: any = {
  dialect: dialect as any,
  logging: (sql: string, timing?: number) => {
    console.debug("[ms-auth][sequelize]", sql, timing ? `(${timing}ms)` : "");
  },
  define: {
    schema: "MS_AUTH", // <--- Importante: Debe coincidir con tu esquema de Oracle
    freezeTableName: true, // Evita que Sequelize pluralice los nombres
    timestamps: true,
    paranoid: true,
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
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
