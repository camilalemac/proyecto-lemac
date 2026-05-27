import { Model, DataTypes } from 'sequelize';
import sequelize from "../config/database.config"; // Ajusta la ruta a tu config

export class MovimientoCep extends Model {
  public movimiento_cep_id!: number;
  public colegio_id!: number;
  public tipo_movimiento_cep!: 'INGRESO' | 'EGRESO';
  public monto_movimiento_cep!: number;
  public desc_movimiento_cep!: string;
  public cate_movimiento_cep!: string;
  public fecha_movimiento_cep!: Date;
  public estado_movimiento_cep!: string;
  
  // Timestamps automáticos
  public readonly created_at_cep!: Date;
  public readonly updated_at_cep!: Date;
}

MovimientoCep.init(
  {
    movimiento_cep_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'MOVIMIENTO_CEP_ID', 
    },
    colegio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'COLEGIO_ID', 
    },
    tipo_movimiento_cep: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['INGRESO', 'EGRESO']],
      },
      field: 'TIPO_MOVIMIENTO_CEP',
    },
    monto_movimiento_cep: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MONTO_MOVIMIENTO_CEP', 
    },
    desc_movimiento_cep: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'DESC_MOVIMIENTO_CEP', 
    },
    cate_movimiento_cep: {
      type: DataTypes.STRING(100),
      allowNull: true, 
      field: 'CATE_MOVIMIENTO_CEP', 
    },
    fecha_movimiento_cep: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'FECHA_MOVIMIENTO_CEP', 
    },
    estado_movimiento_cep: {
      type: DataTypes.STRING(20),
      defaultValue: 'ACTIVO',
      field: 'ESTADO_MOVIMIENTO_CEP', 
    },
  },
  {
    sequelize,
    tableName: 'PAG_MOVIMIENTOS_CEP', 
    timestamps: true, 
    createdAt: 'CREATED_AT_CEP', 
    updatedAt: 'UPDATED_AT_CEP',
  }
);

export default MovimientoCep;