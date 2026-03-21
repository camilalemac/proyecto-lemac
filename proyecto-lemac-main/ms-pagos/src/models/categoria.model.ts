import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database.config";

export class Categoria extends Model<
  InferAttributes<Categoria>,
  InferCreationAttributes<Categoria>
> {
  declare CATEGORIA_ID: CreationOptional<number>;
  declare COLEGIO_ID: number;
  declare NOMBRE: string;
  declare DESCRIPCION: string | null;
  declare FECHA_CREACION: CreationOptional<Date>;
  declare FECHA_ACTUALIZACION: CreationOptional<Date>;
  declare FECHA_BAJA: CreationOptional<Date | null>;
}

Categoria.init(
  {
    CATEGORIA_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    COLEGIO_ID: { type: DataTypes.INTEGER, allowNull: false },
    NOMBRE: { type: DataTypes.STRING(100), allowNull: false },
    DESCRIPCION: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_ACTUALIZACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    FECHA_BAJA: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "PAG_CATEGORIAS",
    schema: "MS_PAGOS",
    timestamps: true,
    paranoid: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
  },
);

export default Categoria;
