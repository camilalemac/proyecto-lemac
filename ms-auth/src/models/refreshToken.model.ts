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
  declare esRevocado: number; 
  declare fechaCreacion?: Date;
  declare fechaActualizacion?: Date;
  declare fechaBaja?: Date;

  static async revokeTokensForUser(userId: number): Promise<void> {
    await RefreshToken.update({ esRevocado: 1 }, { where: { userId, esRevocado: 0 } });
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
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: "COLEGIO_ID",
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
      type: DataTypes.STRING, // Lo devolvemos a STRING por si tu columna es VARCHAR2 o CHAR
      allowNull: false,
      defaultValue: "0",      // Enviamos el caracter '0' que es universal
      field: "ES_REVOCADO",
    },
  },
  {
    sequelize,
    tableName: "AUTH_REFRESH_TOKENS",
    schema: "MS_AUTH",
    modelName: "RefreshToken",
    timestamps: false, // 💡 APAGAMOS LOS TIMESTAMPS DE SEQUELIZE
  },
);

RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

export default RefreshToken;