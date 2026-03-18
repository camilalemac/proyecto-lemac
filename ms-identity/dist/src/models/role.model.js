"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    rolCode: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        field: "ROL_CODE",
    },
    nombreRol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: "NOMBRE_ROL",
    },
    categoria: {
        type: sequelize_1.DataTypes.STRING,
        field: "CATEGORIA",
    },
    nivelAcceso: {
        type: sequelize_1.DataTypes.INTEGER,
        field: "NIVEL_ACCESO",
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        field: "ESTADO",
    },
}, {
    sequelize: database_config_1.default,
    tableName: "IDN_CATALOGO_ROLES",
    modelName: "Role",
    timestamps: false,
});
exports.default = Role;
