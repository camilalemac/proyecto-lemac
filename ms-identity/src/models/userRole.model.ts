import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database.config";
import { Identity } from "./identity.model";
import { Role } from "./role.model";

export class UserRole extends Model<
  InferAttributes<UserRole>,
  InferCreationAttributes<UserRole>
> {
  declare asignacionId?: number;
  declare userId: number;
  declare rolCode: string;
  declare contextoId?: number;
}

UserRole.init(
  {
    asignacionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ASIGNACION_ID",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "USER_ID",
    },
    rolCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "ROL_CODE",
    },
    contextoId: {
      type: DataTypes.INTEGER,
      field: "CONTEXTO_ID",
    },
  },
  {
    sequelize,
    tableName: "IDN_USUARIO_ROLES",
    modelName: "UserRole",
    timestamps: false,
  },
);

Identity.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "USER_ID",
  otherKey: "ROL_CODE",
  as: "roles",
});

Role.belongsToMany(Identity, {
  through: UserRole,
  foreignKey: "ROL_CODE",
  otherKey: "USER_ID",
  as: "users",
});

export default UserRole;
