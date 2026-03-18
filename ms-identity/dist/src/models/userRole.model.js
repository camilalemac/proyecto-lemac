"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
const identity_model_1 = require("./identity.model");
const role_model_1 = require("./role.model");
class UserRole extends sequelize_1.Model {
}
exports.UserRole = UserRole;
UserRole.init({
    asignacionId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "ASIGNACION_ID",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "USER_ID",
    },
    rolCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: "ROL_CODE",
    },
    contextoId: {
        type: sequelize_1.DataTypes.INTEGER,
        field: "CONTEXTO_ID",
    },
}, {
    sequelize: database_config_1.default,
    tableName: "IDN_USUARIO_ROLES",
    modelName: "UserRole",
    timestamps: false,
});
identity_model_1.Identity.belongsToMany(role_model_1.Role, {
    through: UserRole,
    foreignKey: "USER_ID",
    otherKey: "ROL_CODE",
    as: "roles",
});
role_model_1.Role.belongsToMany(identity_model_1.Identity, {
    through: UserRole,
    foreignKey: "ROL_CODE",
    otherKey: "USER_ID",
    as: "users",
});
exports.default = UserRole;
