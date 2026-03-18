import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";
import Curso from "./curso.model";

export enum EstadoPromocion {
  PENDIENTE = "PENDIENTE",
  PROMOVIDO = "PROMOVIDO",
  REPROBADO = "REPROBADO",
}

export enum EstadoMatricula {
  ACTIVA = "ACTIVA",
  RETIRADA = "RETIRADA",
  EGRESADO = "EGRESADO",
}

interface MatriculaAttributes {
  MATRICULA_ID: number;
  COLEGIO_ID: number;
  CURSO_ID: number;
  ALUMNO_ID: number;
  ANIO: number;
  ESTADO_PROMOCION: EstadoPromocion;
  NUMERO_LISTA: number;
  FECHA_ALTA: Date;
  ESTADO: EstadoMatricula;
  FECHA_CREACION: Date;
  FECHA_ACTUALIZACION: Date;
  FECHA_BAJA: Date | null;
}

interface MatriculaCreationAttributes extends Optional<
  MatriculaAttributes,
  "MATRICULA_ID" | "ESTADO_PROMOCION" | "FECHA_CREACION" | "FECHA_ACTUALIZACION" | "FECHA_BAJA"
> {}

class Matricula
  extends Model<MatriculaAttributes, MatriculaCreationAttributes>
  implements MatriculaAttributes
{
  public MATRICULA_ID!: number;
  public COLEGIO_ID!: number;
  public CURSO_ID!: number;
  public ALUMNO_ID!: number;
  public ANIO!: number;
  public ESTADO_PROMOCION!: EstadoPromocion;
  public NUMERO_LISTA!: number;
  public FECHA_ALTA!: Date;
  public ESTADO!: EstadoMatricula;
  public FECHA_CREACION!: Date;
  public FECHA_ACTUALIZACION!: Date;
  public FECHA_BAJA!: Date | null;
}

Matricula.init(
  {
    MATRICULA_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    COLEGIO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CURSO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Curso,
        key: "CURSO_ID",
      },
    },
    ALUMNO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS en MS_IDENTITY",
    },
    ANIO: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ESTADO_PROMOCION: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: EstadoPromocion.PENDIENTE,
      validate: {
        isIn: [[EstadoPromocion.PENDIENTE, EstadoPromocion.PROMOVIDO, EstadoPromocion.REPROBADO]],
      },
    },
    NUMERO_LISTA: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FECHA_ALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ESTADO: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: EstadoMatricula.ACTIVA,
      validate: {
        isIn: [[EstadoMatricula.ACTIVA, EstadoMatricula.RETIRADA, EstadoMatricula.EGRESADO]],
      },
    },
    FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    FECHA_ACTUALIZACION: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    FECHA_BAJA: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
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

// Asociaciones internas del esquema MS_ACADEMICO
Matricula.belongsTo(Curso, { foreignKey: "CURSO_ID", as: "curso" });
Curso.hasMany(Matricula, { foreignKey: "CURSO_ID", as: "matriculas" });

export default Matricula;
