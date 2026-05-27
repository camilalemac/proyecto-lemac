import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database.config";

export class Permission extends Model<
  InferAttributes<Permission>,
  InferCreationAttributes<Permission>
> {
  declare permisoCode: string;
  declare descripcion: string;
  declare modulo?: string;
}

Permission.init(
  {
    permisoCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: "PERMISO_CODE",
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "DESCRIPCION",
    },
    modulo: {
      type: DataTypes.STRING,
      field: "MODULO",
    },
  },
  {
    sequelize,
    tableName: "IDN_PERMISOS",
    modelName: "Permission",
    timestamps: false,
  },
);

export default Permission;
