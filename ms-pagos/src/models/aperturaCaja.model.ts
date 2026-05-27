import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

export class AperturaCaja extends Model<
  InferAttributes<AperturaCaja>,
  InferCreationAttributes<AperturaCaja>
> {
  declare APERTURA_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare CURSO_ID: number;
  declare PERIODO_ANIO: number;
  declare MONTO_APERTURA: number;
  declare CREADO_POR: string | null;
  declare FECHA_REGISTRO: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
}

AperturaCaja.init(
  {
    APERTURA_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    CURSO_ID: { type: DataTypes.INTEGER, allowNull: false },
    PERIODO_ANIO: { type: DataTypes.INTEGER, allowNull: false },
    MONTO_APERTURA: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    CREADO_POR: { type: DataTypes.STRING(100), allowNull: true },
    FECHA_REGISTRO: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "FIN_APERTURA_CAJA",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: false, // No se definió borrado lógico (FECHA_BAJA) en tu script DDL SQL
    createdAt: "FECHA_REGISTRO",
    updatedAt: "FECHA_ACTUALIZACION",
  },
);

export default AperturaCaja;