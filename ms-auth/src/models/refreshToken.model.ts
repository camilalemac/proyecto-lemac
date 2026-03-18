import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.config';
import User from './user.model';

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  declare tokenId?: number;
  declare userId: number;
  declare tokenHash: string;
  declare dispositivo: string;
  declare ipOrigen: string;
  declare fechaExpira: Date;
  declare esRevocado: boolean;
  declare fechaCreacion?: Date;
  declare fechaActualizacion?: Date;
  declare fechaBaja?: Date | null;

  static async revokeTokensForUser(userId: number): Promise<void> {
    await RefreshToken.update({ esRevocado: true }, { where: { userId, esRevocado: false } });
  }
}

RefreshToken.init(
  {
    tokenId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'TOKEN_ID',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID',
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'TOKEN_HASH',
    },
    dispositivo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'DISPOSITIVO',
    },
    ipOrigen: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'IP_ORIGEN',
    },
    fechaExpira: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'FECHA_EXPIRA',
    },
    esRevocado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'ES_REVOCADO',
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'FECHA_CREACION',
    },
    fechaActualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'FECHA_ACTUALIZACION',
    },
    fechaBaja: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'FECHA_BAJA',
    },
  },
  {
    sequelize,
    tableName: 'AUTH_REFRESH_TOKENS',
    modelName: 'RefreshToken',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_ACTUALIZACION',
    deletedAt: 'FECHA_BAJA',
    paranoid: true,
  },
);

RefreshToken.belongsTo(User, { foreignKey: 'USER_ID', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'USER_ID', as: 'refreshTokens' });

export default RefreshToken;
