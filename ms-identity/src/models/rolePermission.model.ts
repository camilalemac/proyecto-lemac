import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database.config";
import { Role } from "./role.model";
import { Permission } from "./permission.model";

export class RolePermission extends Model<
  InferAttributes<RolePermission>,
  InferCreationAttributes<RolePermission>
> {
  declare rolCode: string;
  declare permisoCode: string;
}

RolePermission.init(
  {
    rolCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: "ROL_CODE",
    },
    permisoCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: "PERMISO_CODE",
    },
  },
  {
    sequelize,
    tableName: "IDN_ROL_PERMISOS",
    modelName: "RolePermission",
    timestamps: false,
  },
);

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "ROL_CODE",
  otherKey: "PERMISO_CODE",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "PERMISO_CODE",
  otherKey: "ROL_CODE",
});

export default RolePermission;
