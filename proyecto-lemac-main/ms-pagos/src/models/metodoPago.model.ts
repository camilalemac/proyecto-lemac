import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

export class MetodoPago extends Model<
  InferAttributes<MetodoPago>,
  InferCreationAttributes<MetodoPago>
> {
  declare METODO_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare NOMBRE_METODO: string;
  declare COMISION_PORCENTAJE: number;
  declare COMISION_FIJA: number;
  declare IMPUESTO_PORCENTAJE: number;
  declare ESTADO: CreationOptional<string>;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

MetodoPago.init(
  {
    METODO_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    NOMBRE_METODO: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Ej: Webpay Plus, Khipu, Transferencia Manual",
    },
    COMISION_PORCENTAJE: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    COMISION_FIJA: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    IMPUESTO_PORCENTAJE: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 19.0 },
    ESTADO: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "ACTIVO" },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_METODOS_PAGO",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default MetodoPago;
