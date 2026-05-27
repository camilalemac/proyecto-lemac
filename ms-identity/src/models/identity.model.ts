import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/database.config";

export type IdentityRole =
  | "ALU_REG"
  | "FAM_APO"
  | "STF_PROF"
  | "DIR_SEC_APO"
  | "DIR_SEC_ALU"
  | "DIR_PRES_APO"
  | "STF_DIR"
  | "DIR_PRES_ALU"
  | "user"
  | "SYS_ADMIN"
  | "DIR_PRES_ALU"
  | "DIR_TES_APO"
  | "DIR_TES_ALU"
  | "CEN_PRES_CAL"
  | "CEN_TES_CAL"
  | "CEN_SEC_CAL"
  | "CEN_PRES_CAP"
  | "CEN_TES_CAP"
  | "CEN_SEC_CAP";

export class Identity extends Model<InferAttributes<Identity>, InferCreationAttributes<Identity>> {
  declare userId?: number;
  declare colegioId?: number;
  declare grupoId?: number | null;
  declare rutCuerpo?: string;
  declare rutDv?: string;
  declare nombres?: string;
  declare apellidos?: string;
  declare email: string;
  declare passwordHash: string;
  declare esSistema?: boolean;
  declare estado?: string;
  declare role?: IdentityRole;
  declare comunaId?: number | null;
  declare direccionCalle?: string | null;
  declare fechaCreacion?: Date;
  declare fechaActualizacion?: Date;
  declare fechaBaja?: Date | null;
}

Identity.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "USER_ID",
    },
    colegioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "COLEGIO_ID",
    },
    grupoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "GRUPO_ID",
    },
    rutCuerpo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "RUT_CUERPO",
    },
    rutDv: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "RUT_DV",
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "NOMBRES",
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.BOOLEAN,
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
    role: {
      type: DataTypes.VIRTUAL,
    },
    comunaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "COMUNA_ID",
    },
    direccionCalle: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "DIRECCION_CALLE",
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "FECHA_CREACION",
    },
  },
  {
    sequelize,
    tableName: "IDN_USUARIOS",
    modelName: "Identity",
    timestamps: false,
  },
);

export default Identity;
