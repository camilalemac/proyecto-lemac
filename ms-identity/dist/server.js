"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app_1 = __importDefault(require("./app"));
const database_config_1 = __importDefault(require("./src/config/database.config"));
require("./src/models");
const logger_1 = require("./src/utils/logger");
dotenv_1.default.config();
const walletDir = process.env.WALLET_DIR_NAME || "wallet";
const tnsAdminRaw = process.env.TNS_ADMIN || walletDir;
const projectRoot = path_1.default.resolve(__dirname);
const absoluteWalletPath = path_1.default.isAbsolute(tnsAdminRaw)
    ? tnsAdminRaw
    : path_1.default.resolve(projectRoot, tnsAdminRaw);
if ((process.env.DB_DIALECT || "oracle").toLowerCase() === "oracle") {
    if (!fs_1.default.existsSync(absoluteWalletPath)) {
        console.error(`[Error][ms-identity] Wallet Oracle no encontrado: ${absoluteWalletPath}.`);
        process.exit(1);
    }
    process.env.TNS_ADMIN = absoluteWalletPath;
}
const PORT = Number(process.env.PORT || 3003);
const startServer = async () => {
    try {
        logger_1.logger.info("Iniciando ms-identity");
        logger_1.logger.info(`Intentando conectar a la DB (dialect=${process.env.DB_DIALECT || "oracle"})`);
        await database_config_1.default.authenticate();
        logger_1.logger.info("Conexión con la BD establecida con éxito");
        await database_config_1.default.sync();
        logger_1.logger.info("Sincronización de modelos realizada");
        app_1.default.listen(PORT, () => {
            logger_1.logger.info(`ms-identity running on port ${PORT}`);
            console.log("[ms-identity] Servicio lanzado con éxito");
        });
    }
    catch (error) {
        const internalError = error instanceof Error ? error : new Error("Unknown startup error");
        logger_1.logger.error("Failed to start server", {
            message: internalError.message,
            stack: internalError.stack,
            details: error,
        });
        console.error("Failed to start server:", internalError);
        process.exit(1);
    }
};
startServer();
