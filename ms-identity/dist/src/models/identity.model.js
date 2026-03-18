"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identity = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class Identity extends sequelize_1.Model {
}
exports.Identity = Identity;
Identity.init({
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "USER_ID",
    },
    colegioId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: "COLEGIO_ID",
    },
    grupoId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: "GRUPO_ID",
    },
    rutCuerpo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "RUT_CUERPO",
    },
    rutDv: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "RUT_DV",
    },
    nombres: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "NOMBRES",
    },
    apellidos: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "APELLIDOS",
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        field: "EMAIL",
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: "PASSWORD_HASH",
    },
    esSistema: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "ES_SISTEMA",
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "activo",
        field: "ESTADO",
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "ROLE",
    },
    fechaCreacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "FECHA_CREACION",
    },
    fechaActualizacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "FECHA_ACTUALIZACION",
    },
    fechaBaja: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "FECHA_BAJA",
    },
}, {
    sequelize: database_config_1.default,
    tableName: "IDN_USUARIOS",
    modelName: "Identity",
    timestamps: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    paranoid: true,
    deletedAt: "FECHA_BAJA",
});
exports.default = Identity;
