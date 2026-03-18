"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermission = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
const role_model_1 = require("./role.model");
const permission_model_1 = require("./permission.model");
class RolePermission extends sequelize_1.Model {
}
exports.RolePermission = RolePermission;
RolePermission.init({
    rolCode: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        field: "ROL_CODE",
    },
    permisoCode: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        field: "PERMISO_CODE",
    },
}, {
    sequelize: database_config_1.default,
    tableName: "IDN_ROL_PERMISOS",
    modelName: "RolePermission",
    timestamps: false,
});
role_model_1.Role.belongsToMany(permission_model_1.Permission, {
    through: RolePermission,
    foreignKey: "ROL_CODE",
    otherKey: "PERMISO_CODE",
});
permission_model_1.Permission.belongsToMany(role_model_1.Role, {
    through: RolePermission,
    foreignKey: "PERMISO_CODE",
    otherKey: "ROL_CODE",
});
exports.default = RolePermission;
