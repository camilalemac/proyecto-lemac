import { cuentaCobrarRepository } from "./cuentaCobrar.repository";
import { metodoPagoService, CotizacionPago } from "../metodoPago/metodoPago.service";
import { ApiError } from "../../../utils/ApiError";
import CuentaCobrar from "../../../models/cuentaCobrar.model";

export interface ResumenCobros {
  cobros: CuentaCobrar[];
  totalPendiente: number;
  totalPagado: number;
  cotizacion?: CotizacionPago;
}

export const cuentaCobrarService = {
  listarCobrosDelAlumno: async (alumnoId: number, colegioId: number): Promise<CuentaCobrar[]> => {
    return cuentaCobrarRepository.findAllByAlumno(alumnoId, colegioId);
  },

  listarCobrosPendientesDelAlumno: async (
    alumnoId: number,
    colegioId: number,
  ): Promise<CuentaCobrar[]> => {
    return cuentaCobrarRepository.findPendientesByAlumno(alumnoId, colegioId);
  },

  obtenerCobro: async (cobroId: number, colegioId: number): Promise<CuentaCobrar> => {
    const cobro = await cuentaCobrarRepository.findById(cobroId, colegioId);
    if (!cobro) throw new ApiError(404, `Cobro con ID ${cobroId} no encontrado`);
    return cobro;
  },

  /**
   * Resumen de cobros del alumno con totales calculados.
   * Si se proporciona un metodoId, incluye la cotización con IVA y recargos.
   */
  resumenCobros: async (
    alumnoId: number,
    colegioId: number,
    metodoId?: number,
  ): Promise<ResumenCobros> => {
    const cobros = await cuentaCobrarRepository.findAllByAlumno(alumnoId, colegioId);
    const totalPendiente = cobros
      .filter((c) => c.ESTADO === "PENDIENTE")
      .reduce((acc, c) => acc + (Number(c.MONTO_ORIGINAL) - Number(c.DESCUENTO)), 0);
    const totalPagado = cobros
      .filter((c) => c.ESTADO === "PAGADO")
      .reduce((acc, c) => acc + Number(c.MONTO_PAGADO), 0);

    let cotizacion: CotizacionPago | undefined;
    if (metodoId && totalPendiente > 0) {
      cotizacion = await metodoPagoService.cotizarPago(totalPendiente, metodoId, colegioId);
    }

    return { cobros, totalPendiente, totalPagado, cotizacion };
  },

  crearCobro: async (data: {
    COLEGIO_ID: number;
    ALUMNO_ID: number;
    GRUPO_FAMILIAR_ID: number | null;
    APODERADO_ID: number | null;
    CONCEPTO_ID: number;
    DESCRIPCION: string | null;
    NUMERO_CUOTA: number;
    TOTAL_CUOTAS: number;
    MONTO_ORIGINAL: number;
    FECHA_VENCIMIENTO: Date;
  }): Promise<CuentaCobrar> => {
    return cuentaCobrarRepository.create(data);
  },

  marcarComoExento: async (cobroId: number, colegioId: number): Promise<void> => {
    const cobro = await cuentaCobrarService.obtenerCobro(cobroId, colegioId);
    if (cobro.ESTADO !== "PENDIENTE")
      throw new ApiError(409, "Solo se pueden eximir cobros en estado PENDIENTE");
    await cuentaCobrarRepository.updateEstado(cobroId, colegioId, "EXENTO");
  },

  eliminarCobro: async (cobroId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await cuentaCobrarRepository.softDelete(cobroId, colegioId);
    if (filasAfectadas === 0) throw new ApiError(404, `Cobro con ID ${cobroId} no encontrado`);
  },
};
