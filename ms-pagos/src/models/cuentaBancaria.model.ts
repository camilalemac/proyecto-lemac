import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

export class CuentaBancaria extends Model<
  InferAttributes<CuentaBancaria>,
  InferCreationAttributes<CuentaBancaria>
> {
  declare CUENTA_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare CURSO_ID: number | null;
  declare NOMBRE_CUENTA: string;
  declare BANCO: string;
  declare SALDO_ACTUAL: CreationOptional<number>;
  declare ACTIVO: CreationOptional<boolean>;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

CuentaBancaria.init(
  {
    CUENTA_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    CURSO_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "FK lógica hacia ACA_CURSOS en MS_ACADEMICO",
    },
    NOMBRE_CUENTA: { type: DataTypes.STRING(100), allowNull: false },
    BANCO: { type: DataTypes.STRING(100), allowNull: false },
    SALDO_ACTUAL: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    ACTIVO: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_CUENTAS_BANCARIAS",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default CuentaBancaria;
