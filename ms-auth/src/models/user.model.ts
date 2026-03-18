import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.config';

export type UserRole =
  | 'alumno'
  | 'apoderado'
  | 'profesor'
  | 'tesorero'
  | 'secretario'
  | 'presidente'
  | 'directora'
  | 'administrador';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userId?: number;
  declare colegioId: number;
  declare grupoId: number | null;
  declare rutCuerpo: string;
  declare rutDv: string;
  declare nombres: string;
  declare apellidos: string;
  declare email: string;
  declare passwordHash: string;
  declare esSistema: boolean;
  declare estado: 'activo' | 'inactivo';
  declare role: UserRole;
  declare fechaCreacion?: Date;
  declare fechaActualizacion?: Date;
  declare fechaBaja?: Date | null;

  static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'USER_ID',
    },
    colegioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'COLEGIO_ID',
    },
    grupoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'GRUPO_ID',
    },
    rutCuerpo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'RUT_CUERPO',
    },
    rutDv: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'RUT_DV',
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'NOMBRES',
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'APELLIDOS',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      field: 'EMAIL',
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'PASSWORD_HASH',
    },
    esSistema: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'ES_SISTEMA',
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'activo',
      field: 'ESTADO',
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'alumno',
      field: 'ROLE',
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
    tableName: 'IDN_USUARIOS',
    modelName: 'User',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_ACTUALIZACION',
    deletedAt: 'FECHA_BAJA',
    paranoid: true,
  },
);

export default User;
