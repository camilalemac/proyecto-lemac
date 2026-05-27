import { MovimientoCea } from '../../../models/movimientoCea.model'; 
import { Op } from 'sequelize';

export class CentroAlumnosService {
  
  // 1. Obtener la lista de movimientos
  static async getMovimientos(colegioId: number) {
    try {
      const movimientos = await MovimientoCea.findAll({
        where: {
          colegio_id: colegioId,
          estado_movimiento_cea: 'ACTIVO' // Ignoramos los anulados
        },
        order: [['fecha_movimiento_cea', 'DESC']], // Del más nuevo al más viejo
      });
      return movimientos;
    } catch (error) {
      throw new Error('Error al obtener los movimientos del Centro de Alumnos');
    }
  }

  // 2. Obtener el resumen financiero (Ingresos, Egresos y Saldo)
  static async getResumen(colegioId: number) {
    try {
      const movimientos = await this.getMovimientos(colegioId);

      let totalIngresos = 0;
      let totalEgresos = 0;

      movimientos.forEach((mov) => {
        if (mov.tipo_movimiento_cea === 'INGRESO') {
          totalIngresos += mov.monto_movimiento_cea;
        } else if (mov.tipo_movimiento_cea === 'EGRESO') {
          totalEgresos += mov.monto_movimiento_cea;
        }
      });

      return {
        ingresosExtra: totalIngresos, 
        egresos: totalEgresos,
        saldoActual: totalIngresos - totalEgresos,
        // Dejamos estos en 0 porque el CEA normalmente no cobra "cuotas" mensuales fijas como un curso
        totalPagado: 0,
        totalPendiente: 0 
      };
    } catch (error) {
      throw new Error('Error al calcular el resumen del Centro de Alumnos');
    }
  }

  static async crearMovimiento(colegioId: number, data: { tipo: 'INGRESO' | 'EGRESO', monto: number, descripcion: string, categoria?: string }) {
  try {
    const nuevoMovimiento = await MovimientoCea.create({
      colegio_id: colegioId,
      tipo_movimiento_cea: data.tipo,
      monto_movimiento_cea: data.monto,
      desc_movimiento_cea: data.descripcion,
      cate_movimiento_cea: data.categoria || 'General',
      estado_movimiento_cea: 'ACTIVO'
    });
    return nuevoMovimiento;
  } catch (error: any) {
    // ESTO IMPRIMIRÁ EL ERROR REAL EN LA TERMINAL DE TU BACKEND
    console.error('🚨 ERROR REAL DE SEQUELIZE/ORACLE:', error); 
    throw new Error(`Error de DB: ${error.message}`);
  }
}

}