import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";
import CuentaCobrar from "./cuentaCobrar.model";

export type EstadoExencion = "PENDIENTE" | "APROBADO" | "RECHAZADO";

export class Exencion extends Model<InferAttributes<Exencion>, InferCreationAttributes<Exencion>> {
  declare EXENCION_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare COBRO_ID: number;
  declare FECHA_SOLICITUD: CreationOptional<Date>;
  declare MOTIVO: string;
  declare CHECK_TESORERO: CreationOptional<string>;
  declare FECHA_TESORERO: Date | null;
  declare USER_TESORERO: number | null;
  declare CHECK_PROFESOR: CreationOptional<string>;
  declare FECHA_PROFESOR: Date | null;
  declare USER_PROFESOR: number | null;
  declare ESTADO_FINAL: CreationOptional<EstadoExencion>;
  declare OBSERVACION_RECHAZO: string | null;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

Exencion.init(
  {
    EXENCION_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    COBRO_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CuentaCobrar, key: "COBRO_ID" },
    },
    FECHA_SOLICITUD: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    MOTIVO: { type: DataTypes.STRING(500), allowNull: false },
    CHECK_TESORERO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "N",
      validate: { isIn: [["S", "N"]] },
      comment: "S=aprobado, N=pendiente/rechazado",
    },
    FECHA_TESORERO: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    USER_TESORERO: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    CHECK_PROFESOR: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "N",
      validate: { isIn: [["S", "N"]] },
      comment: "S=aprobado, N=pendiente/rechazado",
    },
    FECHA_PROFESOR: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    USER_PROFESOR: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    ESTADO_FINAL: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDIENTE",
      validate: { isIn: [["PENDIENTE", "APROBADO", "RECHAZADO"]] },
    },
    OBSERVACION_RECHAZO: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_SOLICITUDES_EXENCION",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

Exencion.belongsTo(CuentaCobrar, { foreignKey: "COBRO_ID", as: "cobro" });
CuentaCobrar.hasMany(Exencion, { foreignKey: "COBRO_ID", as: "exenciones" });

export default Exencion;
