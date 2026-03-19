import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/database.config";

// ✅ 1. Actualizamos los tipos para que coincidan con tu IDN_CATALOGO_ROLES
export type UserRole =
  | "SYS_ADMIN"
  | "STF_DIR"
  | "STF_PROF"
  | "STF_ADMIN"
  | "ALU_REG"
  | "FAM_APO"
  | "DIR_PRES_ALU"
  | "DIR_TES_ALU"
  | "DIR_SEC_ALU"
  | "DIR_PRES_APO"
  | "DIR_TES_APO"
  | "DIR_SEC_APO"
  | "CEN_PRES_CAL"
  | "CEN_TES_CAL"
  | "CEN_SEC_CAL"
  | "CEN_PRES_CAP"
  | "CEN_TES_CAP"
  | "CEN_SEC_CAP";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userId?: number;
  declare colegioId: number;
  declare grupoId: number | null;
  declare rutCuerpo: string;
  declare rutDv: string;
  declare nombres: string;
  declare apellidos: string;
  declare email: string;
  declare passwordHash: string;
  declare esSistema: boolean;
  declare estado: string;

  static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "USER_ID",
      allowNull: true,
    },
    colegioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "COLEGIO_ID",
    },
    grupoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "GRUPO_ID",
    },
    rutCuerpo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "RUT_CUERPO",
    },
    rutDv: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "RUT_DV",
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "NOMBRES",
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "APELLIDOS",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      field: "EMAIL",
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "PASSWORD_HASH",
    },
    esSistema: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: false,
      field: "ES_SISTEMA",
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "activo",
      field: "ESTADO",
    },
  },
  {
    sequelize,
    tableName: "IDN_USUARIOS",
    modelName: "User",
    schema: "MS_IDENTITY",
    timestamps: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
    paranoid: true,
  },
);

export default User;
