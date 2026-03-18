"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sequelize_1 = require("sequelize");
// @ts-ignore
const oracledb_1 = __importDefault(require("oracledb"));
const dialect = (process.env.DB_DIALECT || "oracle").toLowerCase();
const dbName = process.env.DB_NAME ||
    (dialect === "mysql" ? "test" : "softwarepayescolar_identity");
const dbUser = process.env.DB_USER || (dialect === "mysql" ? "root" : "system");
const dbPassword = process.env.DB_PASSWORD || "";
const walletDir = process.env.WALLET_DIR_NAME || "wallet";
const tnsAdminRaw = process.env.TNS_ADMIN || walletDir;
const projectRoot = path_1.default.resolve(__dirname, "../../");
const walletPath = path_1.default.isAbsolute(tnsAdminRaw)
    ? tnsAdminRaw
    : path_1.default.resolve(projectRoot, tnsAdminRaw);
let selectedConnectString = process.env.DB_CONNECT_STRING || dbName;
if (dialect === "oracle") {
    const tnsFile = path_1.default.join(walletPath, "tnsnames.ora");
    if (!fs_1.default.existsSync(tnsFile)) {
        throw new Error(`Oracle wallet no encontrado: ${tnsFile}. Asegúrate de que WALLET_DIR_NAME o TNS_ADMIN sea correcto.`);
    }
    const tnsContent = fs_1.default.readFileSync(tnsFile, "utf8");
    const tnEntries = Array.from(new Set((tnsContent.match(/^\s*([A-Za-z0-9_]+)\s*=/gm) || []).map((m) => m.replace(/\s*=\s*$/, ""))));
    // Asegura que sqlnet.ora use el path relativo del wallet actual, no un path de PC específico
    const sqlnetFile = path_1.default.join(walletPath, "sqlnet.ora");
    if (fs_1.default.existsSync(sqlnetFile)) {
        let sqlnetContent = fs_1.default.readFileSync(sqlnetFile, "utf8");
        const normalizedWalletPath = walletPath.replace(/\\/g, "\\\\");
        const updatedSqlnetContent = sqlnetContent.replace(/DIRECTORY\s*=\s*\([^)]*\)/gi, `DIRECTORY=${normalizedWalletPath}`);
        if (updatedSqlnetContent !== sqlnetContent) {
            fs_1.default.writeFileSync(sqlnetFile, updatedSqlnetContent, "utf8");
            console.log(`[ms-identity] sqlnet.ora actualizado con WALLET_LOCATION=${walletPath}`);
        }
    }
    if (!selectedConnectString || !tnEntries.includes(selectedConnectString)) {
        const auto = tnEntries[0];
        if (!auto) {
            throw new Error("No se encontró ninguna entrada válida en tnsnames.ora");
        }
        if (selectedConnectString) {
            console.warn(`Advertencia: '${selectedConnectString}' no existe en tnsnames.ora, usando '${auto}' en su lugar.`);
        }
        selectedConnectString = auto;
    }
    process.env.TNS_ADMIN = walletPath;
    try {
        oracledb_1.default.initOracleClient({
            libDir: undefined,
            configDir: walletPath,
        });
    }
    catch (err) {
        // ignore. can already be initialized.
        console.warn("oracledb.initOracleClient: ", err);
    }
}
console.log("[ms-identity] Configuración DB:");
console.log(`  dialect: ${dialect}`);
console.log(`  dbName: ${dbName}`);
console.log(`  user: ${dbUser}`);
console.log(`  walletPath: ${walletPath}`);
console.log(`  selectedConnectString: ${selectedConnectString}`);
const sequelizeOptions = {
    dialect: dialect,
    logging: (sql, timing) => {
        console.debug("[ms-identity][sequelize]", sql, timing ? `(${timing}ms)` : "");
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
}
else if (dialect === "mysql") {
    sequelizeOptions.host = process.env.DB_HOST || "localhost";
    sequelizeOptions.port = Number(process.env.DB_PORT || 3306);
}
const sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);
exports.default = sequelize;
