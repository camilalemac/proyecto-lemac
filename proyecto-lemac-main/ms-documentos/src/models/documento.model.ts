import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import sequelize from "../config/database.config";

export type TipoDocumento =
  | "ACTA_REUNION"
  | "REPORTE_FINANCIERO_MENSUAL"
  | "REPORTE_FINANCIERO_TRIMESTRAL"
  | "REPORTE_FINANCIERO_ANUAL";
export type EstadoDocumento = "ACTIVO" | "INACTIVO";

export interface DocumentoAttributes {
  DOCUMENTO_ID: number;
  COLEGIO_ID: number;
  CURSO_ID: number | null;
  AUTOR_ID: number;
  TIPO_DOCUMENTO: TipoDocumento;
  TITULO: string;
  DESCRIPCION: string | null;
  URL_ARCHIVO: string;
  ESTADO: EstadoDocumento;
  FECHA_DE_CREACION: Date;
  FECHA_DE_ACTUALIZACION: Date | null;
  FECHA_DE_BAJA: Date | null;
}

export interface DocumentoCreationAttributes extends Optional<
  DocumentoAttributes,
  | "DOCUMENTO_ID"
  | "CURSO_ID"
  | "DESCRIPCION"
  | "ESTADO"
  | "FECHA_DE_CREACION"
  | "FECHA_DE_ACTUALIZACION"
  | "FECHA_DE_BAJA"
> {}

export class Documento
  extends Model<DocumentoAttributes, DocumentoCreationAttributes>
  implements DocumentoAttributes
{
  public DOCUMENTO_ID!: number;
  public COLEGIO_ID!: number;
  public CURSO_ID!: number | null;
  public AUTOR_ID!: number;
  public TIPO_DOCUMENTO!: TipoDocumento;
  public TITULO!: string;
  public DESCRIPCION!: string | null;
  public URL_ARCHIVO!: string;
  public ESTADO!: EstadoDocumento;
  public FECHA_DE_CREACION!: Date;
  public FECHA_DE_ACTUALIZACION!: Date | null;
  public FECHA_DE_BAJA!: Date | null;
}

Documento.init(
  {
    DOCUMENTO_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    CURSO_ID: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    AUTOR_ID: { type: DataTypes.INTEGER, allowNull: false },
    TIPO_DOCUMENTO: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [
          [
            "ACTA_REUNION",
            "REPORTE_FINANCIERO_MENSUAL",
            "REPORTE_FINANCIERO_TRIMESTRAL",
            "REPORTE_FINANCIERO_ANUAL",
          ],
        ],
      },
    },
    TITULO: { type: DataTypes.STRING(150), allowNull: false },
    DESCRIPCION: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
    URL_ARCHIVO: { type: DataTypes.STRING(500), allowNull: false },
    ESTADO: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "ACTIVO" },
    FECHA_DE_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_DE_ACTUALIZACION: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    FECHA_DE_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "REP_DOCUMENTOS",
    schema: "MS_REPORTES",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_DE_CREACION",
    updatedAt: "FECHA_DE_ACTUALIZACION",
    deletedAt: "FECHA_DE_BAJA",
  },
);

// LA SOLUCIÓN DEFINITIVA:
// Obligamos a TypeScript a reconocer que esta clase tiene los métodos estáticos de Sequelize
const DocumentoModel = Documento as ModelStatic<Documento>;

export default DocumentoModel;
