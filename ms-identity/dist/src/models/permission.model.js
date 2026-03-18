"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class Permission extends sequelize_1.Model {
}
exports.Permission = Permission;
Permission.init({
    permisoCode: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        field: "PERMISO_CODE",
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: "DESCRIPCION",
    },
    modulo: {
        type: sequelize_1.DataTypes.STRING,
        field: "MODULO",
    },
}, {
    sequelize: database_config_1.default,
    tableName: "IDN_PERMISOS",
    modelName: "Permission",
    timestamps: false,
});
exports.default = Permission;
