import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";
import Concepto from "./concepto.model";

export type EstadoCobro = "PENDIENTE" | "PAGADO" | "EXENTO" | "VENCIDO";

export class CuentaCobrar extends Model<
  InferAttributes<CuentaCobrar>,
  InferCreationAttributes<CuentaCobrar>
> {
  declare COBRO_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare ALUMNO_ID: number;
  declare GRUPO_FAMILIAR_ID: number | null;
  declare APODERADO_ID: number | null;
  declare CONCEPTO_ID: number;
  declare DESCRIPCION: string | null;
  declare NUMERO_CUOTA: number;
  declare TOTAL_CUOTAS: number;
  declare MONTO_ORIGINAL: number;
  declare DESCUENTO: CreationOptional<number>;
  declare MONTO_PAGADO: CreationOptional<number>;
  declare FECHA_VENCIMIENTO: Date;
  declare ESTADO: CreationOptional<EstadoCobro>;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

CuentaCobrar.init(
  {
    COBRO_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    ALUMNO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK lógica hacia IDN_USUARIOS en MS_IDENTITY",
    },
    GRUPO_FAMILIAR_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "FK lógica hacia IDN_GRUPOS_FAMILIARES en MS_IDENTITY",
    },
    APODERADO_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "FK lógica hacia IDN_USUARIOS (apoderado titular financiero) en MS_IDENTITY",
    },
    CONCEPTO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Concepto, key: "CONCEPTO_ID" },
    },
    DESCRIPCION: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    NUMERO_CUOTA: { type: DataTypes.INTEGER, allowNull: false },
    TOTAL_CUOTAS: { type: DataTypes.INTEGER, allowNull: false },
    MONTO_ORIGINAL: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    DESCUENTO: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    MONTO_PAGADO: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    FECHA_VENCIMIENTO: { type: DataTypes.DATEONLY, allowNull: false },
    ESTADO: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDIENTE",
      validate: { isIn: [["PENDIENTE", "PAGADO", "EXENTO", "VENCIDO"]] },
    },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_CUENTAS_COBRAR",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

CuentaCobrar.belongsTo(Concepto, { foreignKey: "CONCEPTO_ID", as: "concepto" });
Concepto.hasMany(CuentaCobrar, { foreignKey: "CONCEPTO_ID", as: "cobros" });

export default CuentaCobrar;
