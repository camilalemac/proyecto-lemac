import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.config';
import { ApiError } from '../utils/ApiError';

class Provincia extends Model<InferAttributes<Provincia>, InferCreationAttributes<Provincia>> {
  declare provinciaId: number;
  declare nombre: string;
  declare regionId: number;

  static async findByRegionOrdered(idRegion: number): Promise<Provincia[]> {
    return Provincia.findAll({
      where: { regionId: idRegion },
      attributes: ['provinciaId', 'nombre', 'regionId'],
      order: [['nombre', 'ASC']],
    });
  }

  static async getByIdOrThrow(idProvincia: number): Promise<Provincia> {
    const provincia = await Provincia.findByPk(idProvincia);
    if (!provincia) {
      throw new ApiError(404, `La provincia con ID ${idProvincia} no existe en el catálogo.`);
    }
    return provincia;
  }
}

Provincia.init(
  {
    provinciaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'PROVINCIA_ID',
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'NOMBRE',
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'REGION_ID',
    },
  },
  {
    sequelize,
    tableName: 'GEO_PROVINCIAS',
    modelName: 'Provincia',
    timestamps: false,
  },
);

export default Provincia;
