require("dotenv").config();
const path = require("path");
const oracledb = require("oracledb");
const walletPath = path.join(process.cwd(), "wallet");
process.env.TNS_ADMIN = walletPath;
console.log("TNS_ADMIN", process.env.TNS_ADMIN);
try {
  oracledb.initOracleClient({ configDir: walletPath });
  console.log("initOracleClient OK");
} catch (err) {
  console.warn("initOracleClient err", err.message);
}
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const connectString = process.env.DB_CONNECT_STRING || process.env.DB_NAME;
console.log(
  "connectString",
  connectString,
  "user",
  user,
  "password",
  password ? "***" : "missing",
);
oracledb
  .getConnection({ user, password, connectString })
  .then((c) => {
    console.log("Connection successful");
    return c.close();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit(1);
  });
