import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";

interface NivelAttributes {
  NIVEL_ID: number;
  COLEGIO_ID: number;
  NOMBRE: string;
  NOMBRE_CORTO: string;
  GRADO_MINEDUC: number;
  FECHA_CREACION: Date;
  FECHA_ACTUALIZACION: Date;
  FECHA_BAJA: Date | null;
}

interface NivelCreationAttributes extends Optional<
  NivelAttributes,
  "NIVEL_ID" | "FECHA_CREACION" | "FECHA_ACTUALIZACION" | "FECHA_BAJA"
> {}

class Nivel
  extends Model<NivelAttributes, NivelCreationAttributes>
  implements NivelAttributes
{
  public NIVEL_ID!: number;
  public COLEGIO_ID!: number;
  public NOMBRE!: string;
  public NOMBRE_CORTO!: string;
  public GRADO_MINEDUC!: number;
  public FECHA_CREACION!: Date;
  public FECHA_ACTUALIZACION!: Date;
  public FECHA_BAJA!: Date | null;
}

Nivel.init(
  {
    NIVEL_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    COLEGIO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    NOMBRE_CORTO: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    GRADO_MINEDUC: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "ACA_NIVELES",
    schema: "MS_ACADEMICO",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default Nivel;
