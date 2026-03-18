"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermissions = void 0;
const ApiError_1 = require("../../utils/ApiError");
const checkPermissions = (requiredRoles = [], requiredPermissions = []) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new ApiError_1.ApiError(401, "No autorizado"));
        }
        const userRoles = Array.isArray(user.roles)
            ? user.roles
            : user.role
                ? [user.role]
                : [];
        const userPerms = Array.isArray(user.permissions)
            ? user.permissions
            : [];
        const roleAllowed = requiredRoles.length === 0 ||
            requiredRoles.some((r) => userRoles.includes(r));
        const permissionAllowed = requiredPermissions.length === 0 ||
            requiredPermissions.some((p) => userPerms.includes(p));
        if (!roleAllowed || !permissionAllowed) {
            return next(new ApiError_1.ApiError(403, "Permiso denegado"));
        }
        next();
    };
};
exports.checkPermissions = checkPermissions;
