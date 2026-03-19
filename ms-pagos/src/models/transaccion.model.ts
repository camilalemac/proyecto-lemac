import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

/**
 * IMPORTANTE: Esta tabla es BLOCKCHAIN en Oracle (inmutable).
 * Solo acepta INSERT — nunca UPDATE ni DELETE.
 * Se usa como registro de evidencia inmutable de cada pago realizado.
 * Un registro por cada cobro pagado.
 */
export class Transaccion extends Model<
  InferAttributes<Transaccion>,
  InferCreationAttributes<Transaccion>
> {
  declare TRANSACCION_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare COBRO_ID: number;
  declare MONTO_PAGO: number;
  declare METODO_PAGO: string | null;
  declare FECHA_PAGO: CreationOptional<Date>;
}

Transaccion.init(
  {
    TRANSACCION_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    COBRO_ID: { type: DataTypes.INTEGER, allowNull: false },
    MONTO_PAGO: { type: DataTypes.INTEGER, allowNull: false },
    METODO_PAGO: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
    FECHA_PAGO: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "PAG_TRANSACCIONES",
    schema: "MS_PAGOS",
    timestamps: false,
    paranoid: false,
  },
);

export default Transaccion;
