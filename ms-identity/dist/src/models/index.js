"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.RolePermission = exports.Permission = exports.Role = exports.Identity = void 0;
const identity_model_1 = __importDefault(require("./identity.model"));
exports.Identity = identity_model_1.default;
const role_model_1 = __importDefault(require("./role.model"));
exports.Role = role_model_1.default;
const permission_model_1 = __importDefault(require("./permission.model"));
exports.Permission = permission_model_1.default;
const rolePermission_model_1 = __importDefault(require("./rolePermission.model"));
exports.RolePermission = rolePermission_model_1.default;
const userRole_model_1 = __importDefault(require("./userRole.model"));
exports.UserRole = userRole_model_1.default;
