export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'change-this-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '30m',
};

export const refreshConfig = {
  expiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30),
};

export const bcryptConfig = {
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
};
