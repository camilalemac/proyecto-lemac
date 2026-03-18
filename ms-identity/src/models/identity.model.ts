import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database.config";

export type IdentityRole =
  | "alumno"
  | "apoderado"
  | "profesor"
  | "tesorero"
  | "secretario"
  | "presidente"
  | "directora"
  | "administrador"
  | "user"
  | "admin"
  | "supervisor";

export class Identity extends Model<
  InferAttributes<Identity>,
  InferCreationAttributes<Identity>
> {
  declare id?: number;
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
      type: DataTypes.STRING,
      allowNull: true,
      field: "ROLE",
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "FECHA_CREACION",
    },
    fechaActualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "FECHA_ACTUALIZACION",
    },
    fechaBaja: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "FECHA_BAJA",
    },
  },
  {
    sequelize,
    tableName: "IDN_USUARIOS",
    modelName: "Identity",
    timestamps: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    paranoid: true,
    deletedAt: "FECHA_BAJA",
  },
);

export default Identity;
