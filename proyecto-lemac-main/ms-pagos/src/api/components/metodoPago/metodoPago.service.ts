import { metodoPagoRepository } from "./metodoPago.repository";
import { ApiError } from "../../../utils/ApiError";
import MetodoPago from "../../../models/metodoPago.model";

export interface CotizacionPago {
  montoOriginal: number;
  comisionFija: number;
  comisionPorcentaje: number;
  impuesto: number;
  montoTotal: number;
  desglose: string;
}

export const metodoPagoService = {
  listarMetodos: async (colegioId: number): Promise<MetodoPago[]> => {
    return metodoPagoRepository.findAllByColegio(colegioId);
  },

  listarMetodosActivos: async (colegioId: number): Promise<MetodoPago[]> => {
    return metodoPagoRepository.findActivos(colegioId);
  },

  obtenerMetodo: async (metodoId: number, colegioId: number): Promise<MetodoPago> => {
    const metodo = await metodoPagoRepository.findById(metodoId, colegioId);
    if (!metodo) throw new ApiError(404, `Método de pago con ID ${metodoId} no encontrado`);
    return metodo;
  },

  /**
   * Calcula el monto total que pagará el apoderado según el método de pago elegido.
   * Fórmula: montoTotal = montoOriginal + comisionFija + (montoOriginal * comisionPorcentaje / 100) + impuesto
   * El impuesto se calcula sobre la comisión, no sobre el monto original.
   */
  cotizarPago: async (
    montoOriginal: number,
    metodoId: number,
    colegioId: number,
  ): Promise<CotizacionPago> => {
    const metodo = await metodoPagoService.obtenerMetodo(metodoId, colegioId);

    const comisionPorcentajeValor = (montoOriginal * Number(metodo.COMISION_PORCENTAJE)) / 100;
    const comisionFija = Number(metodo.COMISION_FIJA);
    const baseImpuesto = comisionPorcentajeValor + comisionFija;
    const impuesto = (baseImpuesto * Number(metodo.IMPUESTO_PORCENTAJE)) / 100;
    const montoTotal = montoOriginal + comisionFija + comisionPorcentajeValor + impuesto;

    return {
      montoOriginal,
      comisionFija,
      comisionPorcentaje: comisionPorcentajeValor,
      impuesto,
      montoTotal: Math.round(montoTotal),
      desglose: `Monto: $${montoOriginal} + Comisión fija: $${comisionFija} + Comisión %: $${comisionPorcentajeValor.toFixed(2)} + IVA (${metodo.IMPUESTO_PORCENTAJE}%): $${impuesto.toFixed(2)} = Total: $${Math.round(montoTotal)}`,
    };
  },

  crearMetodo: async (data: {
    COLEGIO_ID: number;
    NOMBRE_METODO: string;
    COMISION_PORCENTAJE: number;
    COMISION_FIJA: number;
    IMPUESTO_PORCENTAJE: number;
  }): Promise<MetodoPago> => {
    return metodoPagoRepository.create(data);
  },

  actualizarMetodo: async (
    metodoId: number,
    colegioId: number,
    data: Partial<{
      NOMBRE_METODO: string;
      COMISION_PORCENTAJE: number;
      COMISION_FIJA: number;
      IMPUESTO_PORCENTAJE: number;
      ESTADO: string;
    }>,
  ): Promise<MetodoPago> => {
    const [filasAfectadas] = await metodoPagoRepository.update(metodoId, colegioId, data);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Método de pago con ID ${metodoId} no encontrado`);
    return metodoPagoService.obtenerMetodo(metodoId, colegioId);
  },

  eliminarMetodo: async (metodoId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await metodoPagoRepository.softDelete(metodoId, colegioId);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Método de pago con ID ${metodoId} no encontrado`);
  },
};
