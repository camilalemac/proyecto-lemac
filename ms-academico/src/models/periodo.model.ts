import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";

interface PeriodoAttributes {
  PERIODO_ID: number;
  COLEGIO_ID: number;
  ANIO: number;
  NOMBRE: string;
  FECHA_INICIO: Date;
  FECHA_FIN: Date;
  ESTADO: string;
  FECHA_CREACION: Date;
  FECHA_ACTUALIZACION: Date;
  FECHA_BAJA: Date | null;
}

interface PeriodoCreationAttributes extends Optional<
  PeriodoAttributes,
  "PERIODO_ID" | "FECHA_CREACION" | "FECHA_ACTUALIZACION" | "FECHA_BAJA"
> {}

class Periodo
  extends Model<PeriodoAttributes, PeriodoCreationAttributes>
  implements PeriodoAttributes
{
  public PERIODO_ID!: number;
  public COLEGIO_ID!: number;
  public ANIO!: number;
  public NOMBRE!: string;
  public FECHA_INICIO!: Date;
  public FECHA_FIN!: Date;
  public ESTADO!: string;
  public FECHA_CREACION!: Date;
  public FECHA_ACTUALIZACION!: Date;
  public FECHA_BAJA!: Date | null;
}

Periodo.init(
  {
    PERIODO_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    COLEGIO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ANIO: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    FECHA_INICIO: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    FECHA_FIN: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ESTADO: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ACTIVO",
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
    tableName: "ACA_PERIODOS",
    schema: "MS_ACADEMICO",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default Periodo;
