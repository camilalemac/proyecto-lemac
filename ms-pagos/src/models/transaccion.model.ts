import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

export type EstadoTransaccion = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "ANULADA";

export class Transaccion extends Model<
  InferAttributes<Transaccion>,
  InferCreationAttributes<Transaccion>
> {
  declare TRANSACCION_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare COBRO_IDS: string;
  declare MONTO_PAGO: number;
  declare METODO_PAGO: string;
  declare ESTADO: CreationOptional<EstadoTransaccion>;
  declare TOKEN_PASARELA: string | null;
  declare URL_PAGO: string | null;
  declare FECHA_PAGO: Date | null;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

Transaccion.init(
  {
    TRANSACCION_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    COBRO_IDS: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "IDs de cobros separados por coma para pagos múltiples",
    },
    MONTO_PAGO: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    METODO_PAGO: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Ej: WEBPAY, KHIPU, TRANSFERENCIA",
    },
    ESTADO: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDIENTE",
      validate: { isIn: [["PENDIENTE", "APROBADA", "RECHAZADA", "ANULADA"]] },
    },
    TOKEN_PASARELA: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment: "Token retornado por la pasarela de pago",
    },
    URL_PAGO: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      comment: "URL de redirección al portal de pago",
    },
    FECHA_PAGO: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_TRANSACCIONES",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default Transaccion;
