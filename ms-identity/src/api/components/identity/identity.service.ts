import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Identity } from "../../../models/identity.model";
import { Role } from "../../../models/role.model";
import { Permission } from "../../../models/permission.model";
import { UserRole } from "../../../models/userRole.model";
import { ApiError } from "../../../utils/ApiError";

const jwtSecret: jwt.Secret = (process.env.JWT_SECRET ||
  "your-very-strong-secret") as jwt.Secret;
const jwtExpiresIn: jwt.SignOptions["expiresIn"] = (process.env
  .JWT_EXPIRES_IN || "30m") as jwt.SignOptions["expiresIn"];
const jwtRefreshExpiresIn: jwt.SignOptions["expiresIn"] =
  `${process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30}d` as jwt.SignOptions["expiresIn"];

const DEFAULT_ROLE = "alumno";

export const getUserRoles = async (userId: number) => {
  const user = await Identity.findByPk(userId, {
    include: [{ model: Role, as: "roles" }],
  });
  return (user as any)?.roles ?? [];
};

export const getUserPermissions = async (userId: number) => {
  const roles = await getUserRoles(userId);
  const permissionsSet = new Set<string>();

  for (const role of roles as any[]) {
    const roleWithPermissions = await Role.findByPk(role.rolCode, {
      include: [{ model: Permission, as: "permissions" }],
    });
    const perms = (roleWithPermissions as any)?.permissions ?? [];
    perms.forEach((perm: any) => permissionsSet.add(perm.permisoCode));
  }

  return Array.from(permissionsSet);
};

export const register = async (payload: any) => {
  const existing = await Identity.findOne({ where: { email: payload.email } });
  if (existing) throw new ApiError(409, "User already exists");

  const passwordHash = await bcrypt.hash(
    payload.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );
  const created = await Identity.create({
    ...payload,
    passwordHash,
    role: payload.role || DEFAULT_ROLE,
  });

  const roleCodes: string[] =
    Array.isArray(payload.roles) && payload.roles.length > 0
      ? payload.roles
      : [payload.role || DEFAULT_ROLE];
  const distinctRoleCodes = Array.from(new Set(roleCodes));

  const existingRoles = await Role.findAll({
    where: { rolCode: distinctRoleCodes },
  });

  const userRoleEntries = existingRoles.map((roleItem) => ({
    userId: created.userId as number,
    rolCode: roleItem.rolCode,
  }));

  if (userRoleEntries.length) {
    await UserRole.bulkCreate(userRoleEntries, { ignoreDuplicates: true });
  }

  return { id: created.userId, email: created.email, roles: distinctRoleCodes };
};

export const login = async (payload: any) => {
  const user = await Identity.findOne({ where: { email: payload.email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const roles = (await getUserRoles(user.userId ?? 0)).map(
    (role) => role.rolCode,
  );
  const permissions = await getUserPermissions(user.userId ?? 0);

  const token = jwt.sign(
    {
      sub: user.userId,
      email: user.email,
      roles,
      permissions,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );

  const refreshToken = jwt.sign({ sub: user.userId }, jwtSecret, {
    expiresIn: jwtRefreshExpiresIn,
  });

  return { token, refreshToken };
};

export const refresh = async (payload: any) => {
  try {
    const decoded = jwt.verify(payload.refreshToken, jwtSecret) as any;
    const user = await Identity.findByPk(decoded.sub);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    const roles = (await getUserRoles(user.userId ?? 0)).map(
      (role) => role.rolCode,
    );
    const permissions = await getUserPermissions(user.userId ?? 0);

    const token = jwt.sign(
      {
        sub: user.userId,
        email: user.email,
        roles,
        permissions,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn },
    );
    return { token };
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }
};

export const logout = async (_userId: string) => {
  return true;
};

export const me = async (userId: string) => {
  const user = await Identity.findByPk(userId, {
    include: [{ model: Role, as: "roles" }],
  });
  if (!user) throw new ApiError(404, "User not found");

  const roles = (user as any)?.roles?.map((r: any) => r.rolCode) ?? [];
  const permissions = await getUserPermissions(user.userId ?? 0);

  return {
    id: user.userId,
    email: user.email,
    roles,
    permissions,
  };
};

export const getCuotas = async (userId: string) => {
  return { userId, cuotasPagadas: [], cuotasPendientes: [] };
};

export const getGastosPorCategoria = async (userId: string) => {
  return { userId, gastos: [] };
};

export const pagarBonoCooperacion = async (userId: string, payload: any) => {
  return { userId, pago: payload, status: "pendiente" };
};

export const pagarCuotas = async (userId: string, payload: any) => {
  return { userId, cuotas: payload, status: "pendiente" };
};

export const getGrupoFamiliar = async (userId: string) => {
  return { userId, hijos: [] };
};

export const getAlumnosCurso = async (userId: string) => {
  return { userId, alumnos: [] };
};

export const promoverAlumnos = async (userId: string, payload: any) => {
  return { userId, promovidos: payload.alumnos || [] };
};

export const exencionPagos = async (userId: string, payload: any) => {
  return { userId, exenciones: payload.alumnos || [] };
};

export const validarCuentaAlumno = async (userId: string, payload: any) => {
  return { userId, validado: payload.alumnoId, email: payload.email };
};

export const generarReportes = async (userId: string, payload: any) => {
  return { userId, reportes: payload, generados: true };
};

export const agregarCuentaPago = async (userId: string, payload: any) => {
  return { userId, cuenta: payload, agregada: true };
};
