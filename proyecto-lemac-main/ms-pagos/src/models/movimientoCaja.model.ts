import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";
import CuentaBancaria from "./cuentaBancaria.model";
import Categoria from "./categoria.model";

export type TipoMovimiento = "INGRESO" | "EGRESO";

export class MovimientoCaja extends Model<
  InferAttributes<MovimientoCaja>,
  InferCreationAttributes<MovimientoCaja>
> {
  declare MOVIMIENTO_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare CUENTA_ID: number;
  declare RESPONSABLE_ID: number;
  declare CATEGORIA_ID: number;
  declare TIPO_MOVIMIENTO: TipoMovimiento;
  declare GLOSA: string;
  declare MONTO: number;
  declare COMPROBANTE_URL: string | null;
  declare FECHA_MOVIMIENTO: Date;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

MovimientoCaja.init(
  {
    MOVIMIENTO_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    CUENTA_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CuentaBancaria, key: "CUENTA_ID" },
    },
    RESPONSABLE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS (tesorero) en MS_IDENTITY",
    },
    CATEGORIA_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Categoria, key: "CATEGORIA_ID" },
    },
    TIPO_MOVIMIENTO: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isIn: [["INGRESO", "EGRESO"]] },
    },
    GLOSA: { type: DataTypes.STRING(255), allowNull: false },
    MONTO: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    COMPROBANTE_URL: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
    FECHA_MOVIMIENTO: { type: DataTypes.DATE, allowNull: false },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_MOVIMIENTOS_CAJA",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

MovimientoCaja.belongsTo(CuentaBancaria, { foreignKey: "CUENTA_ID", as: "cuentaBancaria" });
CuentaBancaria.hasMany(MovimientoCaja, { foreignKey: "CUENTA_ID", as: "movimientos" });

MovimientoCaja.belongsTo(Categoria, { foreignKey: "CATEGORIA_ID", as: "categoria" });
Categoria.hasMany(MovimientoCaja, { foreignKey: "CATEGORIA_ID", as: "movimientos" });

export default MovimientoCaja;
