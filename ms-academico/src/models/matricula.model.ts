import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";
import Curso from "./curso.model";

export enum EstadoPromocion {
  EN_CURSO = "EN_CURSO",
  PROMOVIDO = "PROMOVIDO",
  REPROBADO = "REPROBADO",
}

export enum EstadoMatricula {
  REGULAR = "REGULAR",
  RETIRADO = "RETIRADO",
  EGRESADO = "EGRESADO",
}

export class Matricula extends Model<
  InferAttributes<Matricula>,
  InferCreationAttributes<Matricula>
> {
  declare MATRICULA_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare CURSO_ID: number;
  declare ALUMNO_ID: number;
  declare ANIO: number;
  declare ESTADO_PROMOCION: CreationOptional<EstadoPromocion>;
  declare NUMERO_LISTA: number | null;
  declare FECHA_ALTA: CreationOptional<Date>;
  declare ESTADO: CreationOptional<EstadoMatricula>;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

Matricula.init(
  {
    MATRICULA_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    CURSO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Curso, key: "CURSO_ID" },
    },
    ALUMNO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS en MS_IDENTITY",
    },
    ANIO: { type: DataTypes.INTEGER, allowNull: false },
    ESTADO_PROMOCION: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: EstadoPromocion.EN_CURSO,
      validate: {
        isIn: [[EstadoPromocion.EN_CURSO, EstadoPromocion.PROMOVIDO, EstadoPromocion.REPROBADO]],
      },
    },
    NUMERO_LISTA: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    FECHA_ALTA: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    ESTADO: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: EstadoMatricula.REGULAR,
      validate: {
        isIn: [[EstadoMatricula.REGULAR, EstadoMatricula.RETIRADO, EstadoMatricula.EGRESADO]],
      },
    },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "ACA_MATRICULAS",
    schema: "MS_ACADEMICO",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

Matricula.belongsTo(Curso, { foreignKey: "CURSO_ID", as: "curso" });
Curso.hasMany(Matricula, { foreignKey: "CURSO_ID", as: "matriculas" });

export default Matricula;
