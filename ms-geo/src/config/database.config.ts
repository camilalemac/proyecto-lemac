import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import fs from "fs"; // Importamos sistema de archivos para verificar
// @ts-ignore
import oracledb from "oracledb";

dotenv.config();

// 1. Determinar Ruta Absoluta y Verificar Existencia
const walletPath = path.join(process.cwd(), "wallet");
const tnsFile = path.join(walletPath, "tnsnames.ora");

console.log("================================================");
console.log("🔍 DIAGNÓSTICO DE RUTA WALLET");
console.log(`📂 Directorio base (CWD): ${process.cwd()}`);
console.log(`📂 Ruta Wallet calculada: ${walletPath}`);
console.log(`📄 Buscando archivo:      ${tnsFile}`);

if (fs.existsSync(tnsFile)) {
  console.log("✅ ÉXITO: El archivo tnsnames.ora FUE ENCONTRADO.");
} else {
  console.error("❌ ERROR CRÍTICO: NO se encuentra tnsnames.ora en esa ruta.");
  console.error(
    '👉 Verifica que la carpeta se llame "wallet" (minúsculas) y esté dentro de ms-geo.',
  );
  process.exit(1); // Detenemos todo si no está el archivo
}
console.log("================================================");

// 2. Inicializar Driver
try {
  // @ts-ignore
  oracledb.initOracleClient({
    libDir: undefined,
    configDir: walletPath,
  });
} catch (err) {
  // Ignorar
}

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const walletPassword = process.env.WALLET_PASSWORD as string;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect: "oracle",
  dialectOptions: {
    connectString: dbName,
    walletLocation: walletPath,
    walletPassword: walletPassword,
    connectTimeout: 20000,
  },
  logging: false,
  pool: { max: 5, min: 0, acquire: 20000, idle: 10000 },
});

export default sequelize;
