import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/database.config";

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare rolCode: string;
  declare nombreRol: string;
  declare categoria?: string;
  declare nivelAcceso?: number;
}

Role.init(
  {
    rolCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: "ROL_CODE",
    },
    nombreRol: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "NOMBRE_ROL",
    },
    categoria: {
      type: DataTypes.STRING,
      field: "CATEGORIA",
    },
    nivelAcceso: {
      type: DataTypes.INTEGER,
      field: "NIVEL_ACCESO",
    },
  },
  {
    sequelize,
    tableName: "IDN_CATALOGO_ROLES",
    modelName: "Role",
    timestamps: false,
  },
);

export default Role;
