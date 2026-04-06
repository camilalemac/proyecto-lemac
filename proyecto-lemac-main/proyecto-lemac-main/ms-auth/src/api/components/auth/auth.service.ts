import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op, QueryTypes } from "sequelize"; // <-- Añadí QueryTypes aquí
import { ApiError } from "../../../utils/ApiError";
import { RefreshToken, User } from "../../../models";
import { bcryptConfig, jwtConfig, refreshConfig } from "../../../config";
import sequelize from "../../../config/database.config";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function signAccessToken(payload: object): string {
  return jwt.sign(payload, jwtConfig.secret as jwt.Secret, {
    expiresIn: jwtConfig.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(payload: object): string {
  const expiresIn = `${refreshConfig.expiresInDays}d`;
  return jwt.sign(payload, jwtConfig.secret as jwt.Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, bcryptConfig.saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  // Aplicamos trim() al hash de la DB por si tiene padding de espacios (común en Oracle CHAR)
  return bcrypt.compare(password, hash.trim());
};

export const login = async (
  email: string,
  password: string,
  dispositivo = "unknown",
  ipOrigen = "unknown",
): Promise<AuthTokens> => {
  const emailNormalizado = email.toLowerCase().trim();

  // Búsqueda blindada: TRIM y LOWER tanto en la columna de la DB como en el valor buscado
  const user = await User.findOne({
    where: sequelize.where(
      sequelize.fn("TRIM", sequelize.fn("LOWER", sequelize.col("EMAIL"))),
      emailNormalizado,
    ),
    paranoid: false, // <--- OBLIGATORIO: Esto ignora la columna FECHA_BAJA
  });

  console.log("---------------- DEBUG LOGIN ----------------");
  console.log(`1. Buscando Email (recibido): [${email}]`);
  console.log(`2. Email normalizado: [${emailNormalizado}]`);

  if (!user) {
    console.log("❌ Resultado: Usuario NO encontrado en la DB.");
    throw new ApiError(401, "Credenciales inválidas");
  }

  console.log(`✅ Usuario encontrado: [${user.email}]`);
  console.log(`3. Estado en DB: [${user.estado}]`);

  // Verificación manual de estado (ignorando espacios y case)
  if (user.estado.trim().toUpperCase() !== "ACTIVO") {
    console.log(`❌ Resultado: El usuario tiene estado [${user.estado}], no ACTIVO.`);
    throw new ApiError(401, "Credenciales inválidas");
  }

  // Comparamos la contraseña PLANA enviada contra el HASH de la DB
  const valid = await verifyPassword(password, user.passwordHash);
  console.log(`4. ¿Password coincide?: ${valid}`);
  console.log("---------------------------------------------");

  if (!valid) throw new ApiError(401, "Credenciales inválidas");

  // ✅ BUSCAMOS EL ROL EN LA TABLA INTERMEDIA (RAW QUERY)
  // Utilizamos QueryTypes para ejecutar SQL directo sin necesidad de tener el Modelo de Sequelize creado
  const userRoles: any[] = await sequelize.query(
    `SELECT ROL_CODE FROM MS_IDENTITY.IDN_USUARIO_ROLES WHERE USER_ID = :userId AND ESTADO = 'ACTIVO'`,
    {
      replacements: { userId: user.userId },
      type: QueryTypes.SELECT,
    },
  );

  // Extraemos el rol, si no tiene asignado, puedes lanzar un error o poner un default.
  // Aquí asumo que si lo encuentra lo toma, si no, lo dejamos como "FAM_APO" por precaución.
  let rolAsignado = "FAM_APO";
  if (userRoles && userRoles.length > 0) {
    rolAsignado = userRoles[0].ROL_CODE || userRoles[0].rol_code;
  }

  // ✅ INYECTAMOS EL ROL AL PAYLOAD
  const payload = {
    userId: user.userId,
    colegioId: user.colegioId,
    role: rolAsignado, // <--- ¡AQUÍ ESTÁ LA MAGIA!
    nombre: `${user.nombres} ${user.apellidos}`,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = await bcrypt.hash(refreshToken, bcryptConfig.saltRounds);
  await RefreshToken.create({
    userId: user.userId!,
    colegioId: user.colegioId,
    tokenHash,
    dispositivo,
    ipOrigen,
    fechaExpira: new Date(Date.now() + refreshConfig.expiresInDays * 24 * 3600 * 1000),
    esRevocado: false,
  });

  return { accessToken, refreshToken };
};

export const register = async (userData: {
  colegioId: number;
  grupoId?: number;
  rutCuerpo: string;
  rutDv: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const existing = await User.findOne({
    where: sequelize.where(
      sequelize.fn("LOWER", sequelize.col("EMAIL")),
      userData.email.toLowerCase().trim(),
    ),
  });

  if (existing) {
    throw new ApiError(409, "El correo ya está registrado");
  }

  const passwordHash = await hashPassword(userData.password);
  const user = await User.create({
    colegioId: userData.colegioId,
    grupoId: userData.grupoId ?? null,
    rutCuerpo: userData.rutCuerpo,
    rutDv: userData.rutDv,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    email: userData.email.toLowerCase().trim(),
    passwordHash,
    esSistema: false,
    estado: "ACTIVO",
  });

  // Nota: Si en el registro también asignas rol, aquí deberías insertar un registro en IDN_USUARIO_ROLES
  // para que quede guardado en tu base de datos y funcione con el Login.

  return {
    userId: user.userId,
    email: user.email,
    colegioId: user.colegioId,
  };
};

export const refresh = async (
  refreshToken: string,
  dispositivo = "unknown",
  ipOrigen = "unknown",
): Promise<AuthTokens> => {
  let decodedPayload: any;
  try {
    decodedPayload = jwt.verify(refreshToken, jwtConfig.secret);
  } catch (err) {
    throw new ApiError(401, "Refresh token inválido");
  }

  const user = await User.findOne({
    where: {
      userId: decodedPayload.userId,
      estado: { [Op.or]: ["activo", "ACTIVO"] },
    },
  });

  if (!user) throw new ApiError(401, "Usuario inválido");

  const token = await RefreshToken.findOne({
    where: {
      userId: decodedPayload.userId,
      esRevocado: false,
      fechaExpira: { [Op.gt]: new Date() },
    },
    order: [["FECHA_CREACION", "DESC"]],
  });

  if (!token) throw new ApiError(401, "Refresh token revocado o expirado");

  const isValid = await verifyPassword(refreshToken, token.tokenHash);
  if (!isValid) {
    throw new ApiError(401, "Refresh token inválido");
  }

  await token.update({ esRevocado: true });

  // ✅ BUSCAMOS EL ROL NUEVAMENTE EN EL REFRESH (RAW QUERY)
  const userRoles: any[] = await sequelize.query(
    `SELECT ROL_CODE FROM MS_IDENTITY.IDN_USUARIO_ROLES WHERE USER_ID = :userId AND ESTADO = 'ACTIVO'`,
    {
      replacements: { userId: user.userId },
      type: QueryTypes.SELECT,
    },
  );

  let rolAsignado = "FAM_APO";
  if (userRoles && userRoles.length > 0) {
    rolAsignado = userRoles[0].ROL_CODE || userRoles[0].rol_code;
  }

  // ✅ INYECTAMOS EL ROL AL PAYLOAD NUEVO
  const newPayload = {
    userId: user.userId,
    colegioId: user.colegioId,
    role: rolAsignado,
  };

  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  const newTokenHash = await bcrypt.hash(newRefreshToken, bcryptConfig.saltRounds);
  await RefreshToken.create({
    userId: user.userId!,
    colegioId: user.colegioId,
    tokenHash: newTokenHash,
    dispositivo,
    ipOrigen,
    fechaExpira: new Date(Date.now() + refreshConfig.expiresInDays * 24 * 3600 * 1000),
    esRevocado: false,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (token: string): Promise<void> => {
  try {
    const payload: any = jwt.verify(token, jwtConfig.secret);
    await RefreshToken.update(
      { esRevocado: true },
      { where: { userId: payload.userId, esRevocado: false } },
    );
  } catch {
    throw new ApiError(401, "Token inválido");
  }
};
