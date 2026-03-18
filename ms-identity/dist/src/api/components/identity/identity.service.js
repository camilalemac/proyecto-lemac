"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agregarCuentaPago = exports.generarReportes = exports.validarCuentaAlumno = exports.exencionPagos = exports.promoverAlumnos = exports.getAlumnosCurso = exports.getGrupoFamiliar = exports.pagarCuotas = exports.pagarBonoCooperacion = exports.getGastosPorCategoria = exports.getCuotas = exports.me = exports.logout = exports.refresh = exports.login = exports.register = exports.getUserPermissions = exports.getUserRoles = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const identity_model_1 = require("../../../models/identity.model");
const role_model_1 = require("../../../models/role.model");
const permission_model_1 = require("../../../models/permission.model");
const userRole_model_1 = require("../../../models/userRole.model");
const ApiError_1 = require("../../../utils/ApiError");
const jwtSecret = (process.env.JWT_SECRET ||
    "your-very-strong-secret");
const jwtExpiresIn = (process.env
    .JWT_EXPIRES_IN || "30m");
const jwtRefreshExpiresIn = `${process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30}d`;
const DEFAULT_ROLE = "alumno";
const getUserRoles = async (userId) => {
    const user = await identity_model_1.Identity.findByPk(userId, {
        include: [{ model: role_model_1.Role, as: "roles" }],
    });
    return user?.roles ?? [];
};
exports.getUserRoles = getUserRoles;
const getUserPermissions = async (userId) => {
    const roles = await (0, exports.getUserRoles)(userId);
    const permissionsSet = new Set();
    for (const role of roles) {
        const roleWithPermissions = await role_model_1.Role.findByPk(role.rolCode, {
            include: [{ model: permission_model_1.Permission, as: "permissions" }],
        });
        const perms = roleWithPermissions?.permissions ?? [];
        perms.forEach((perm) => permissionsSet.add(perm.permisoCode));
    }
    return Array.from(permissionsSet);
};
exports.getUserPermissions = getUserPermissions;
const register = async (payload) => {
    const existing = await identity_model_1.Identity.findOne({ where: { email: payload.email } });
    if (existing)
        throw new ApiError_1.ApiError(409, "User already exists");
    const passwordHash = await bcrypt_1.default.hash(payload.password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
    const created = await identity_model_1.Identity.create({
        ...payload,
        passwordHash,
        role: payload.role || DEFAULT_ROLE,
    });
    const roleCodes = Array.isArray(payload.roles) && payload.roles.length > 0
        ? payload.roles
        : [payload.role || DEFAULT_ROLE];
    const distinctRoleCodes = Array.from(new Set(roleCodes));
    const existingRoles = await role_model_1.Role.findAll({
        where: { rolCode: distinctRoleCodes },
    });
    const userRoleEntries = existingRoles.map((roleItem) => ({
        userId: created.userId,
        rolCode: roleItem.rolCode,
    }));
    if (userRoleEntries.length) {
        await userRole_model_1.UserRole.bulkCreate(userRoleEntries, { ignoreDuplicates: true });
    }
    return { id: created.userId, email: created.email, roles: distinctRoleCodes };
};
exports.register = register;
const login = async (payload) => {
    const user = await identity_model_1.Identity.findOne({ where: { email: payload.email } });
    if (!user)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    const isValid = await bcrypt_1.default.compare(payload.password, user.passwordHash);
    if (!isValid)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    const roles = (await (0, exports.getUserRoles)(user.userId ?? 0)).map((role) => role.rolCode);
    const permissions = await (0, exports.getUserPermissions)(user.userId ?? 0);
    const token = jwt.sign({
        sub: user.userId,
        email: user.email,
        roles,
        permissions,
    }, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jwt.sign({ sub: user.userId }, jwtSecret, {
        expiresIn: jwtRefreshExpiresIn,
    });
    return { token, refreshToken };
};
exports.login = login;
const refresh = async (payload) => {
    try {
        const decoded = jwt.verify(payload.refreshToken, jwtSecret);
        const user = await identity_model_1.Identity.findByPk(decoded.sub);
        if (!user)
            throw new ApiError_1.ApiError(401, "Invalid refresh token");
        const roles = (await (0, exports.getUserRoles)(user.userId ?? 0)).map((role) => role.rolCode);
        const permissions = await (0, exports.getUserPermissions)(user.userId ?? 0);
        const token = jwt.sign({
            sub: user.userId,
            email: user.email,
            roles,
            permissions,
        }, jwtSecret, { expiresIn: jwtExpiresIn });
        return { token };
    }
    catch {
        throw new ApiError_1.ApiError(401, "Invalid refresh token");
    }
};
exports.refresh = refresh;
const logout = async (_userId) => {
    return true;
};
exports.logout = logout;
const me = async (userId) => {
    const user = await identity_model_1.Identity.findByPk(userId, {
        include: [{ model: role_model_1.Role, as: "roles" }],
    });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    const roles = user?.roles?.map((r) => r.rolCode) ?? [];
    const permissions = await (0, exports.getUserPermissions)(user.userId ?? 0);
    return {
        id: user.userId,
        email: user.email,
        roles,
        permissions,
    };
};
exports.me = me;
const getCuotas = async (userId) => {
    return { userId, cuotasPagadas: [], cuotasPendientes: [] };
};
exports.getCuotas = getCuotas;
const getGastosPorCategoria = async (userId) => {
    return { userId, gastos: [] };
};
exports.getGastosPorCategoria = getGastosPorCategoria;
const pagarBonoCooperacion = async (userId, payload) => {
    return { userId, pago: payload, status: "pendiente" };
};
exports.pagarBonoCooperacion = pagarBonoCooperacion;
const pagarCuotas = async (userId, payload) => {
    return { userId, cuotas: payload, status: "pendiente" };
};
exports.pagarCuotas = pagarCuotas;
const getGrupoFamiliar = async (userId) => {
    return { userId, hijos: [] };
};
exports.getGrupoFamiliar = getGrupoFamiliar;
const getAlumnosCurso = async (userId) => {
    return { userId, alumnos: [] };
};
exports.getAlumnosCurso = getAlumnosCurso;
const promoverAlumnos = async (userId, payload) => {
    return { userId, promovidos: payload.alumnos || [] };
};
exports.promoverAlumnos = promoverAlumnos;
const exencionPagos = async (userId, payload) => {
    return { userId, exenciones: payload.alumnos || [] };
};
exports.exencionPagos = exencionPagos;
const validarCuentaAlumno = async (userId, payload) => {
    return { userId, validado: payload.alumnoId, email: payload.email };
};
exports.validarCuentaAlumno = validarCuentaAlumno;
const generarReportes = async (userId, payload) => {
    return { userId, reportes: payload, generados: true };
};
exports.generarReportes = generarReportes;
const agregarCuentaPago = async (userId, payload) => {
    return { userId, cuenta: payload, agregada: true };
};
exports.agregarCuentaPago = agregarCuentaPago;
