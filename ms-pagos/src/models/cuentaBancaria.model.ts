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
  declare CURSO_ID: number;
  declare NOMBRE_CUENTA: string;
  declare BANCO: string | null;
  declare SALDO_ACTUAL: CreationOptional<number>;
  declare ACTIVO: CreationOptional<string>;
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
      allowNull: false,
      comment: "FK lógica hacia ACA_CURSOS en MS_ACADEMICO",
    },
    NOMBRE_CUENTA: { type: DataTypes.STRING(50), allowNull: false },
    BANCO: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
    SALDO_ACTUAL: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ACTIVO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "S",
      validate: { isIn: [["S", "N"]] },
    },
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
