import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.config';
import { ApiError } from '../utils/ApiError';

class Comuna extends Model<InferAttributes<Comuna>, InferCreationAttributes<Comuna>> {
  declare comunaId: number;
  declare nombre: string;
  declare provinciaId: number;

  static async findByProvinciaOrdered(idProvincia: number): Promise<Comuna[]> {
    return Comuna.findAll({
      where: { provinciaId: idProvincia },
      attributes: ['comunaId', 'nombre', 'provinciaId'],
      order: [['nombre', 'ASC']],
    });
  }

  static async getByIdOrThrow(idComuna: number): Promise<Comuna> {
    const comuna = await Comuna.findByPk(idComuna);
    if (!comuna) {
      throw new ApiError(404, `La comuna con ID ${idComuna} no existe en el catálogo.`);
    }
    return comuna;
  }
}

Comuna.init(
  {
    comunaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'COMUNA_ID',
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'NOMBRE',
    },
    provinciaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'PROVINCIA_ID',
    },
  },
  {
    sequelize,
    tableName: 'GEO_COMUNAS',
    modelName: 'Comuna',
    timestamps: false,
  },
);

export default Comuna;
