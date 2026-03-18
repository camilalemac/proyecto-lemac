import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database.config";

interface FamiliaAttributes {
  RELACION_ID: number;
  COLEGIO_ID: number;
  ALUMNO_ID: number;
  APODERADO_ID: number;
  TIPO_RELACION: string;
  ES_APODERADO_ACAD: boolean;
  ES_TITULAR_FINAN: boolean;
  AUTORIZADO_RETIRO: boolean;
  FECHA_CREACION: Date;
  FECHA_ACTUALIZACION: Date;
  FECHA_BAJA: Date | null;
}

interface FamiliaCreationAttributes extends Optional<
  FamiliaAttributes,
  | "RELACION_ID"
  | "ES_APODERADO_ACAD"
  | "ES_TITULAR_FINAN"
  | "AUTORIZADO_RETIRO"
  | "FECHA_CREACION"
  | "FECHA_ACTUALIZACION"
  | "FECHA_BAJA"
> {}

class Familia
  extends Model<FamiliaAttributes, FamiliaCreationAttributes>
  implements FamiliaAttributes
{
  public RELACION_ID!: number;
  public COLEGIO_ID!: number;
  public ALUMNO_ID!: number;
  public APODERADO_ID!: number;
  public TIPO_RELACION!: string;
  public ES_APODERADO_ACAD!: boolean;
  public ES_TITULAR_FINAN!: boolean;
  public AUTORIZADO_RETIRO!: boolean;
  public FECHA_CREACION!: Date;
  public FECHA_ACTUALIZACION!: Date;
  public FECHA_BAJA!: Date | null;
}

Familia.init(
  {
    RELACION_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    COLEGIO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ALUMNO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS (alumno) en MS_IDENTITY",
    },
    APODERADO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS (apoderado) en MS_IDENTITY",
    },
    TIPO_RELACION: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Ej: PADRE, MADRE, TUTOR",
    },
    ES_APODERADO_ACAD: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si es el apoderado académico principal del alumno",
    },
    ES_TITULAR_FINAN: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si es el titular financiero responsable de los pagos",
    },
    AUTORIZADO_RETIRO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si está autorizado para retirar al alumno",
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
