import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { ApiError } from '../../../utils/ApiError';
import { RefreshToken, User } from '../../../models';
import { bcryptConfig, jwtConfig, refreshConfig } from '../../../config';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function signAccessToken(payload: object): string {
  return jwt.sign(payload, jwtConfig.secret as jwt.Secret, { expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'] });
}

function signRefreshToken(payload: object): string {
  const expiresIn = `${refreshConfig.expiresInDays}d`;
  return jwt.sign(payload, jwtConfig.secret as jwt.Secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, bcryptConfig.saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const login = async (email: string, password: string, dispositivo = 'unknown', ipOrigen = 'unknown'):
  Promise<AuthTokens> => {
  const user = await User.findOne({ where: { email, estado: 'activo' } });
  if (!user) throw new ApiError(401, 'Credenciales inválidas');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Credenciales inválidas');

  const accessToken = signAccessToken({ userId: user.userId, colegioId: user.colegioId, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.userId, colegioId: user.colegioId });

  const tokenHash = await bcrypt.hash(refreshToken, bcryptConfig.saltRounds);
  await RefreshToken.create({
    userId: user.userId!,
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
  const existing = await User.findOne({ where: { email: userData.email } });
  if (existing) {
    throw new ApiError(409, 'El correo ya está registrado');
  }

  const passwordHash = await hashPassword(userData.password);
  const user = await User.create({
    colegioId: userData.colegioId,
    grupoId: userData.grupoId ?? null,
    rutCuerpo: userData.rutCuerpo,
    rutDv: userData.rutDv,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    email: userData.email,
    passwordHash,
    esSistema: false,
    estado: 'activo',
    role: (userData.role as any) ?? 'alumno',
  });

  return {
    userId: user.userId,
    email: user.email,
    role: user.role,
    colegioId: user.colegioId,
  };
};

export const refresh = async (refreshToken: string, dispositivo = 'unknown', ipOrigen = 'unknown'): Promise<AuthTokens> => {
  let payload: any;
  try {
    payload = jwt.verify(refreshToken, jwtConfig.secret);
  } catch (err) {
    throw new ApiError(401, 'Refresh token inválido');
  }

  const user = await User.findOne({ where: { userId: payload.userId, estado: 'activo' } });
  if (!user) throw new ApiError(401, 'Usuario inválido');

  const token = await RefreshToken.findOne({
    where: {
      userId: payload.userId,
      esRevocado: false,
      fechaExpira: { [Op.gt]: new Date() },
    },
    order: [['fechaCreacion', 'DESC']],
  });

  if (!token) throw new ApiError(401, 'Refresh token revocado o expirado');

  const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
  if (!isValid) {
    throw new ApiError(401, 'Refresh token inválido');
  }

  await token.update({ esRevocado: true });

  const newAccessToken = signAccessToken({ userId: user.userId, colegioId: user.colegioId, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.userId, colegioId: user.colegioId });

  const newTokenHash = await bcrypt.hash(newRefreshToken, bcryptConfig.saltRounds);
  await RefreshToken.create({
    userId: user.userId!,
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
    throw new ApiError(401, 'Token inválido');
  }
};
