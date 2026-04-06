import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";
import Nivel from "./nivel.model";
import Periodo from "./periodo.model";

interface CursoAttributes {
  CURSO_ID: number;
  COLEGIO_ID: number;
  PERIODO_ID: number;
  NIVEL_ID: number;
  LETRA: string;
  PROFESOR_JEFE_ID: number | null;
  FECHA_CREACION: Date;
  FECHA_ACTUALIZACION: Date;
  FECHA_BAJA: Date | null;
}

interface CursoCreationAttributes extends Optional<
  CursoAttributes,
  "CURSO_ID" | "PROFESOR_JEFE_ID" | "FECHA_CREACION" | "FECHA_ACTUALIZACION" | "FECHA_BAJA"
> {}

class Curso extends Model<CursoAttributes, CursoCreationAttributes> implements CursoAttributes {
  public CURSO_ID!: number;
  public COLEGIO_ID!: number;
  public PERIODO_ID!: number;
  public NIVEL_ID!: number;
  public LETRA!: string;
  public PROFESOR_JEFE_ID!: number | null;
  public FECHA_CREACION!: Date;
  public FECHA_ACTUALIZACION!: Date;
  public FECHA_BAJA!: Date | null;
}

Curso.init(
  {
    CURSO_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    COLEGIO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PERIODO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Periodo,
        key: "PERIODO_ID",
      },
    },
    NIVEL_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Nivel,
        key: "NIVEL_ID",
      },
    },
    LETRA: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    PROFESOR_JEFE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "FK lógica hacia IDN_USUARIOS en MS_IDENTITY",
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
    tableName: "ACA_CURSOS",
    schema: "MS_ACADEMICO",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

// Asociaciones internas del esquema MS_ACADEMICO
Curso.belongsTo(Nivel, { foreignKey: "NIVEL_ID", as: "nivel" });
Nivel.hasMany(Curso, { foreignKey: "NIVEL_ID", as: "cursos" });

Curso.belongsTo(Periodo, { foreignKey: "PERIODO_ID", as: "periodo" });
Periodo.hasMany(Curso, { foreignKey: "PERIODO_ID", as: "cursos" });

export default Curso;
