import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";
import Categoria from "./categoria.model";

export class Concepto extends Model<InferAttributes<Concepto>, InferCreationAttributes<Concepto>> {
  declare CONCEPTO_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare CATEGORIA_ID: number;
  declare CUENTA_DESTINO_ID: number;
  declare CODIGO: string;
  declare NOMBRE: string;
  declare MONTO_BASE: number;
  declare TIPO_COBRO: string;
  declare ACTIVO: CreationOptional<boolean>;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

Concepto.init(
  {
    CONCEPTO_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    CATEGORIA_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Categoria, key: "CATEGORIA_ID" },
    },
    CUENTA_DESTINO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia PAG_CUENTAS_BANCARIAS",
    },
    CODIGO: { type: DataTypes.STRING(20), allowNull: false },
    NOMBRE: { type: DataTypes.STRING(100), allowNull: false },
    MONTO_BASE: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    TIPO_COBRO: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Ej: MENSUAL, ANUAL, BONO, EXTRAORDINARIO",
    },
    ACTIVO: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_CONCEPTOS",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

Concepto.belongsTo(Categoria, { foreignKey: "CATEGORIA_ID", as: "categoria" });
Categoria.hasMany(Concepto, { foreignKey: "CATEGORIA_ID", as: "conceptos" });

export default Concepto;
