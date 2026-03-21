import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/database.config";
import User from "./user.model";

export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare tokenId?: number;
  declare userId: number;
  declare colegioId: number;
  declare tokenHash: string;
  declare dispositivo: string;
  declare ipOrigen: string;
  declare fechaExpira: Date;
  declare esRevocado: boolean;

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
      field: "TOKEN_ID",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "USER_ID",
    },
    colegioId: {
      type: DataTypes.NUMBER, // o INTEGER dependiendo de tu setup
      allowNull: false,
      field: "COLEGIO_ID", // <--- Muy importante para que Sequelize sepa mapearlo a Oracle
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "TOKEN_HASH",
    },
    dispositivo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "DISPOSITIVO",
    },
    ipOrigen: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "IP_ORIGEN",
    },
    fechaExpira: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "FECHA_EXPIRA",
    },
    esRevocado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "ES_REVOCADO",
    },
  },
  {
    sequelize,
    tableName: "AUTH_REFRESH_TOKENS",
    schema: "MS_AUTH",
    modelName: "RefreshToken",
    timestamps: true,
    createdAt: "FECHA_CREACION",
    updatedAt: "FECHA_ACTUALIZACION",
    deletedAt: "FECHA_BAJA",
    paranoid: true,
  },
);

RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

export default RefreshToken;
