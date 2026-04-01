import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.config';
import { ApiError } from '../utils/ApiError';

class Region extends Model<InferAttributes<Region>, InferCreationAttributes<Region>> {
  declare regionId: number;
  declare nombre: string;
  declare abreviatura: string;
  declare capital: string;

  static async findAllOrdered(): Promise<Region[]> {
    return Region.findAll({
      attributes: ['regionId', 'nombre', 'abreviatura', 'capital'],
      order: [['regionId', 'ASC']],
    });
  }

  static async getByIdOrThrow(idRegion: number): Promise<Region> {
    const region = await Region.findByPk(idRegion);
    if (!region) {
      throw new ApiError(404, `La región con ID ${idRegion} no existe en el catálogo.`);
    }
    return region;
  }
}

Region.init(
  {
    regionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Asumimos auto-increment, aunque sea solo lectura
      field: 'REGION_ID',
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'NOMBRE',
    },
    abreviatura: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ABREVIATURA',
    },
    capital: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'CAPITAL',
    },
  },
  {
    sequelize,
    tableName: 'GEO_REGIONES',
    modelName: 'Region',
    timestamps: false,
  },
);

export default Region;
