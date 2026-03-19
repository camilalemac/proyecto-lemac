import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import sequelize from "../../../config/database.config";
import { Identity } from "../../../models/identity.model";
import { Role } from "../../../models/role.model";
import { Permission } from "../../../models/permission.model";
import { UserRole } from "../../../models/userRole.model";
import { ApiError } from "../../../utils/ApiError";
import { hmacHash } from "../../../utils/crypto.util";

const jwtSecret: jwt.Secret = (process.env.JWT_SECRET || "your-very-strong-secret") as jwt.Secret;
const jwtExpiresIn: jwt.SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ||
  "30m") as jwt.SignOptions["expiresIn"];
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
  // Email en texto plano — necesario para recuperación de contraseña y notificaciones
  const existing = await Identity.findOne({ where: { email: payload.email } });
  if (existing) throw new ApiError(409, "Usuario ya existe");

  // Contraseña hasheada con bcrypt
  const passwordHash = await bcrypt.hash(
    payload.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );

  // RUT hasheado con HMAC — no se necesita leer, solo validar identidad
  const rutCuerpoHash = payload.rutCuerpo ? hmacHash(payload.rutCuerpo) : null;
  const rutDvHash = payload.rutDv ? hmacHash(payload.rutDv) : null;

  const created = await Identity.create({
    ...payload,
    nombres: payload.nombres ?? null,
    apellidos: payload.apellidos ?? null,
    rutCuerpo: rutCuerpoHash,
    rutDv: rutDvHash,
    passwordHash,
    role: payload.role || DEFAULT_ROLE,
  });

  const roleCodes: string[] =
    Array.isArray(payload.roles) && payload.roles.length > 0
      ? payload.roles
      : [payload.role || DEFAULT_ROLE];

  const distinctRoleCodes = Array.from(new Set(roleCodes));
  const existingRoles = await Role.findAll({ where: { rolCode: distinctRoleCodes } });
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
  if (!user) throw new ApiError(401, "Credenciales inválidas");

  const isValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Credenciales inválidas");

  const roles = (await getUserRoles(user.userId ?? 0)).map((role) => role.rolCode);
  const permissions = await getUserPermissions(user.userId ?? 0);

  const token = jwt.sign(
    {
      sub: user.userId,
      userId: user.userId,
      colegioId: user.colegioId,
      email: user.email,
      nombres: user.nombres ?? "",
      apellidos: user.apellidos ?? "",
      role: user.role,
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
    if (!user) throw new ApiError(401, "Refresh token inválido");

    const roles = (await getUserRoles(user.userId ?? 0)).map((role) => role.rolCode);
    const permissions = await getUserPermissions(user.userId ?? 0);

    const token = jwt.sign(
      {
        sub: user.userId,
        userId: user.userId,
        colegioId: user.colegioId,
        email: user.email,
        nombres: user.nombres ?? "",
        apellidos: user.apellidos ?? "",
        role: user.role,
        roles,
        permissions,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn },
    );

    return { token };
  } catch {
    throw new ApiError(401, "Refresh token inválido");
  }
};

export const logout = async (_userId: string) => {
  return true;
};

export const me = async (userId: number) => {
  // 1. Usamos findOne para filtrar manualmente a los usuarios no eliminados (fechaBaja: null)
  const user = await Identity.findOne({
    where: { userId: userId, estado: "ACTIVO" },
    include: [{ model: Role, as: "roles" }],
  });

  if (!user) throw new ApiError(404, "Usuario no encontrado");

  // 2. Formateamos los datos según el contrato
  const rutCompleto = user.rutCuerpo && user.rutDv ? `${user.rutCuerpo}-${user.rutDv}` : null;

  const rolesFormateados =
    (user as any).roles?.map((r: any) => ({
      rol_code: r.rolCode,
      nombre_rol: r.nombreRol,
      categoria: r.categoria,
    })) ?? [];

  // 3. Retornamos la estructura perfecta
  return {
    perfil: {
      user_id: user.userId,
      nombres: user.nombres,
      apellidos: user.apellidos,
      rut_completo: rutCompleto,
      email: user.email,
      estado: user.estado,
      grupo_familiar: user.grupoId ?? null,
    },
    roles: rolesFormateados,
    academico: { cursos_jefatura: [] },
    finanzas: null,
    seguridad: {
      ultimo_acceso: "18/03/26 23:24:34",
      ip: "190.168.1.45",
    },
  };
};

export const createUser = async (userData: any) => {
  // 1. Iniciamos la transacción para asegurar que todo se guarde o nada se guarde
  const t = await sequelize.transaction();

  try {
    // 2. Verificamos que no exista un usuario con ese RUT en el mismo colegio
    const existingUser = await Identity.findOne({
      where: {
        colegioId: userData.colegioId,
        rutCuerpo: userData.rutCuerpo,
      },
      transaction: t,
    });

    if (existingUser) {
      throw new ApiError(400, "Ya existe un usuario registrado con este RUT en el colegio.");
    }

    // 3. Hasheamos la contraseña con bcrypt (12 rondas de salt como en el script)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // 4. Inserción cruda (Raw Query) para evadir los bugs de Sequelize con Oracle
    await sequelize.query(
      `INSERT INTO "IDN_USUARIOS" 
        ("COLEGIO_ID", "GRUPO_ID", "RUT_CUERPO", "RUT_DV", "NOMBRES", "APELLIDOS", "EMAIL", "PASSWORD_HASH", "ESTADO") 
       VALUES 
        (:colegioId, :grupoId, :rutCuerpo, :rutDv, :nombres, :apellidos, :email, :passwordHash, 'ACTIVO')`,
      {
        replacements: {
          colegioId: userData.colegioId,
          grupoId: userData.grupoId || null,
          rutCuerpo: userData.rutCuerpo,
          rutDv: userData.rutDv,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          email: userData.email,
          passwordHash: hashedPassword,
        },
        transaction: t, // <- ¡Mantenemos la transacción segura!
      },
    );

    // 4.1 Buscamos al usuario que acabamos de insertar EN LA MISMA TRANSACCIÓN para obtener su ID real
    const newUser = await Identity.findOne({
      where: {
        colegioId: userData.colegioId,
        rutCuerpo: userData.rutCuerpo,
      },
      transaction: t,
    });

    if (!newUser || !newUser.userId) {
      throw new Error("No se pudo recuperar el usuario recién creado en la base de datos.");
    }

    // ---> ESTA ES LA MAGIA QUE QUITA LOS ERRORES ROJOS <---
    if (!newUser || !newUser.userId) {
      throw new Error("No se pudo recuperar el usuario recién creado en la base de datos.");
    }

    // 5. Le asignamos su rol en la tabla IDN_USUARIO_ROLES
    await UserRole.create(
      {
        userId: newUser.userId, // Ya no se quejará de que es undefined
        rolCode: userData.rolCode,
        estado: "ACTIVO",
      },
      { transaction: t },
    );

    // 6. Si todo fue exitoso, confirmamos los cambios en la BD
    await t.commit();

    // 7. Retornamos los datos limpios (sin el hash por seguridad)
    return {
      user_id: newUser.userId, // Ya no dirá que posiblemente es null
      nombres: newUser.nombres,
      apellidos: newUser.apellidos,
      email: newUser.email,
      rol_code: userData.rolCode,
      estado: newUser.estado,
    };
  } catch (error) {
    // Si algo falla, revertimos cualquier inserción a medias
    await t.rollback();
    throw error;
  }
};

export const findByRut = async (rutCuerpo: string, rutDv: string) => {
  // Buscamos al usuario por su RUT en la tabla idn_usuarios
  const user = await Identity.findOne({
    where: {
      rutCuerpo: rutCuerpo,
      rutDv: rutDv,
    },
  });

  // Si no existe, lanzamos un error 404
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado con ese RUT.");
  }

  // Retornamos los datos del usuario encontrado
  return user;
};
