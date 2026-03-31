import { cuentaCobrarRepository } from "./cuentaCobrar.repository";
import { conceptoRepository } from "../concepto/concepto.repository";
import { metodoPagoService, CotizacionPago } from "../metodoPago/metodoPago.service";
import { ApiError } from "../../../utils/ApiError";
import CuentaCobrar from "../../../models/cuentaCobrar.model";
import sequelize from "../../../config/database.config";

export interface ResumenCobros {
  cobros: CuentaCobrar[];
  totalPendiente: number;
  totalPagado: number;
  cotizacion?: CotizacionPago;
}

export const cuentaCobrarService = {
  listarCobrosDelAlumno: async (alumnoId: number, colegioId: number): Promise<CuentaCobrar[]> => {
    // Corregido: nombre exacto de la función en tu repository
    return await cuentaCobrarRepository.findAllByAlumno(alumnoId, colegioId);
  },

  resumenCobros: async (
    alumnoId: number,
    colegioId: number,
    metodoId?: number,
  ): Promise<ResumenCobros> => {
    const cobros = await cuentaCobrarRepository.findAllByAlumno(alumnoId, colegioId);

    // Corregido: Añadidos tipos (c: CuentaCobrar) para que TypeScript no se queje
    const totalPendiente = cobros
      .filter((c: CuentaCobrar) => c.ESTADO === "PENDIENTE")
      .reduce(
        (acc: number, curr: CuentaCobrar) =>
          acc + (Number(curr.MONTO_ORIGINAL) - Number(curr.MONTO_PAGADO)),
        0,
      );

    const totalPagado = cobros
      .filter((c: CuentaCobrar) => c.ESTADO === "PAGADO")
      .reduce((acc: number, curr: CuentaCobrar) => acc + Number(curr.MONTO_PAGADO), 0);

    let cotizacion;
    if (metodoId && totalPendiente > 0) {
      // Corregido: Se agregó colegioId que era el tercer parámetro faltante
      cotizacion = await metodoPagoService.cotizarPago(totalPendiente, metodoId, colegioId);
    }

    return { cobros, totalPendiente, totalPagado, cotizacion };
  },

  crearCobro: async (data: any): Promise<CuentaCobrar> => {
    // Asumiendo que tu repository tiene 'create' o usa el modelo directamente
    return await CuentaCobrar.create({
      ...data,
      ESTADO: "PENDIENTE",
      MONTO_PAGADO: 0,
    });
  },

  eliminarCobro: async (cobroId: number, colegioId: number): Promise<void> => {
    // Si tu repository no tiene 'delete', usamos el modelo directamente
    const deleted = await CuentaCobrar.destroy({
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId },
    });
    if (!deleted) throw new ApiError(404, "El cobro no existe o no pertenece al colegio");
  },

  generarCobroMasivoPorCurso: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number;
    CONCEPTO_ID: number;
    DESCRIPCION: string;
    FECHA_VENCIMIENTO: Date;
    NUMERO_CUOTA: number;
    TOTAL_CUOTAS: number;
  }): Promise<{ mensaje: string; cobrosGenerados: number }> => {
    // Iniciamos la transacción aquí
    const t = await sequelize.transaction();

    try {
      const concepto = await conceptoRepository.findById(data.CONCEPTO_ID, data.COLEGIO_ID);
      if (!concepto) {
        throw new ApiError(404, `Concepto de cobro con ID ${data.CONCEPTO_ID} no encontrado`);
      }

      const alumnos = await cuentaCobrarRepository.obtenerDatosFinancierosAlumnosPorCurso(
        data.CURSO_ID,
        data.COLEGIO_ID,
      );

      if (alumnos.length === 0) {
        throw new ApiError(400, "No hay alumnos matriculados en este curso.");
      }

      const nuevosCobros = alumnos.map((alumno) => ({
        COLEGIO_ID: data.COLEGIO_ID,
        ALUMNO_ID: alumno.ALUMNO_ID,
        GRUPO_FAMILIAR_ID: alumno.GRUPO_FAMILIAR_ID,
        APODERADO_ID: alumno.APODERADO_ID,
        CONCEPTO_ID: data.CONCEPTO_ID,
        DESCRIPCION: data.DESCRIPCION,
        NUMERO_CUOTA: data.NUMERO_CUOTA,
        TOTAL_CUOTAS: data.TOTAL_CUOTAS,
        MONTO_ORIGINAL: concepto.getDataValue("MONTO_BASE"),
        FECHA_VENCIMIENTO: data.FECHA_VENCIMIENTO,
        ESTADO: "PENDIENTE",
        MONTO_PAGADO: 0,
      }));

      // Le pasamos la transacción al bulkCreate
      await cuentaCobrarRepository.bulkCreate(nuevosCobros, t);

      // Si todo sale bien, guardamos definitivamente
      await t.commit();

      return {
        mensaje: "Cobros generados exitosamente",
        cobrosGenerados: nuevosCobros.length,
      };
    } catch (error) {
      // Si falla cualquier cosa (ej. se cae la BD a la mitad), deshacemos todo
      await t.rollback();
      throw error;
    }
  },
};
