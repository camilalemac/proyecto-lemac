import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

export class Familia extends Model<InferAttributes<Familia>, InferCreationAttributes<Familia>> {
  declare RELACION_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare ALUMNO_ID: number;
  declare APODERADO_ID: number;
  declare TIPO_RELACION: string;
  declare ES_APODERADO_ACAD: CreationOptional<string>;
  declare ES_TITULAR_FINAN: CreationOptional<string>;
  declare AUTORIZADO_RETIRO: CreationOptional<string>;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

Familia.init(
  {
    RELACION_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    ALUMNO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS en MS_IDENTITY",
    },
    APODERADO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS en MS_IDENTITY",
    },
    TIPO_RELACION: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [["PADRE", "MADRE", "ABUELO", "TIO", "HERMANO", "TUTOR"]] },
    },
    ES_APODERADO_ACAD: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "N",
      validate: { isIn: [["S", "N"]] },
      comment: "S = Sí, N = No",
    },
    ES_TITULAR_FINAN: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "N",
      validate: { isIn: [["S", "N"]] },
      comment: "S = Sí, N = No",
    },
    AUTORIZADO_RETIRO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "N",
      validate: { isIn: [["S", "N"]] },
      comment: "S = Sí, N = No",
    },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "ACA_FAMILIAS",
    schema: "MS_ACADEMICO",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default Familia;
