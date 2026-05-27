import { Model, DataTypes } from 'sequelize';
import sequelize from "../config/database.config"; 

export class MovimientoCea extends Model {
  public movimiento_cea_id!: number;
  public colegio_id!: number;
  public tipo_movimiento_cea!: 'INGRESO' | 'EGRESO';
  public monto_movimiento_cea!: number;
  public desc_movimiento_cea!: string;
  public cate_movimiento_cea!: string;
  public fecha_movimiento_cea!: Date;
  public estado_movimiento_cea!: string;
  
  // Timestamps automáticos
  public readonly created_at_cea!: Date;
  public readonly updated_at_cea!: Date;
}

MovimientoCea.init(
  {
    movimiento_cea_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'MOVIMIENTO_CEA_ID', // 👈 Mapeo exacto en MAYÚSCULAS para Oracle
    },
    colegio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'COLEGIO_ID', // 👈 Mapeo exacto en MAYÚSCULAS
    },
    tipo_movimiento_cea: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['INGRESO', 'EGRESO']],
      },
      field: 'TIPO_MOVIMIENTO_CEA', // 👈 Mapeo exacto en MAYÚSCULAS
    },
    monto_movimiento_cea: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MONTO_MOVIMIENTO_CEA', // 👈 Mapeo exacto en MAYÚSCULAS
    },
    desc_movimiento_cea: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'DESC_MOVIMIENTO_CEA', // 👈 Mapeo exacto en MAYÚSCULAS
    },
    cate_movimiento_cea: {
      type: DataTypes.STRING(100),
      allowNull: true, 
      field: 'CATE_MOVIMIENTO_CEA', // 👈 Mapeo exacto en MAYÚSCULAS
    },
    fecha_movimiento_cea: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'FECHA_MOVIMIENTO_CEA', // 👈 Mapeo exacto en MAYÚSCULAS
    },
    estado_movimiento_cea: {
      type: DataTypes.STRING(20),
      defaultValue: 'ACTIVO',
      field: 'ESTADO_MOVIMIENTO_CEA', // 👈 Mapeo exacto en MAYÚSCULAS
    },
  },
  {
    sequelize,
    tableName: 'PAG_MOVIMIENTOS_CEA', // 👈 Nombre de la tabla en MAYÚSCULAS
    timestamps: true, 
    createdAt: 'CREATED_AT_CEA',       // 👈 Timestamp en MAYÚSCULAS
    updatedAt: 'UPDATED_AT_CEA',       // 👈 Timestamp en MAYÚSCULAS
  }
);

export default MovimientoCea;