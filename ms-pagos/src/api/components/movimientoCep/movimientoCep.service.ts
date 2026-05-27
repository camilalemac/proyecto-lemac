import { MovimientoCep } from '../../../models/movimientoCep.model'; // Ajusta tu ruta al modelo
import { Op } from 'sequelize';

export class CentroPadresService {
  
  // 1. Obtener la lista de movimientos
  static async getMovimientos(colegioId: number) {
    try {
      const movimientos = await MovimientoCep.findAll({
        where: {
          colegio_id: colegioId,
          estado_movimiento_cep: 'ACTIVO' // Ignoramos los anulados
        },
        order: [['fecha_movimiento_cep', 'DESC']], // Del más nuevo al más viejo
      });
      return movimientos;
    } catch (error) {
      throw new Error('Error al obtener los movimientos del Centro de Padres');
    }
  }

  // 2. Obtener el resumen financiero (Ingresos, Egresos y Saldo)
  static async getResumen(colegioId: number) {
    try {
      const movimientos = await this.getMovimientos(colegioId);

      let totalIngresos = 0;
      let totalEgresos = 0;

      movimientos.forEach((mov) => {
        if (mov.tipo_movimiento_cep === 'INGRESO') {
          totalIngresos += mov.monto_movimiento_cep;
        } else if (mov.tipo_movimiento_cep === 'EGRESO') {
          totalEgresos += mov.monto_movimiento_cep;
        }
      });

      return {
        ingresosExtra: totalIngresos, 
        egresos: totalEgresos,
        saldoActual: totalIngresos - totalEgresos,
        totalPagado: 0,
        totalPendiente: 0 
      };
    } catch (error) {
      throw new Error('Error al calcular el resumen del Centro de Padres');
    }
  }

  // 3. Crear un nuevo movimiento
  static async crearMovimiento(colegioId: number, data: { tipo: 'INGRESO' | 'EGRESO', monto: number, descripcion: string, categoria?: string }) {
    try {
      const nuevoMovimiento = await MovimientoCep.create({
        colegio_id: colegioId,
        tipo_movimiento_cep: data.tipo,
        monto_movimiento_cep: data.monto,
        desc_movimiento_cep: data.descripcion,
        cate_movimiento_cep: data.categoria || 'General',
        estado_movimiento_cep: 'ACTIVO'
      });
      return nuevoMovimiento;
    } catch (error: any) {
      console.error('🚨 ERROR REAL DE SEQUELIZE/ORACLE EN CEP:', error); 
      throw new Error(`Error de DB: ${error.message}`);
    }
  }
}