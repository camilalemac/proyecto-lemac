import { aperturaCajaRepository } from "./aperturaCaja.repository";
import AperturaCaja from "../../../models/aperturaCaja.model";
import { ApiError } from "../../../utils/ApiError";

export const aperturaCajaService = {
  obtenerApertura: async (
    cursoId: number,
    periodoAnio: number,
    colegioId: number,
  ): Promise<AperturaCaja | null> => {
    return await aperturaCajaRepository.findByCursoAndAnio(cursoId, periodoAnio, colegioId);
  },

  registrarApertura: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number;
    PERIODO_ANIO: number;
    MONTO_APERTURA: number;
    CREADO_POR: string | null;
  }): Promise<AperturaCaja> => {
    // Buscamos si ya existe una apertura para el binomio Curso + Año (Garantiza idempotencia ante UQ_CURSO_PERIODO)
    const aperturaExistente = await aperturaCajaRepository.findByCursoAndAnio(
      data.CURSO_ID,
      data.PERIODO_ANIO,
      data.COLEGIO_ID,
    );

    if (aperturaExistente) {
      await aperturaCajaRepository.updateMonto(aperturaExistente.APERTURA_ID, data.COLEGIO_ID, {
        MONTO_APERTURA: data.MONTO_APERTURA,
        CREADO_POR: data.CREADO_POR,
      });

      const registroActualizado = await aperturaCajaRepository.findByCursoAndAnio(
        data.CURSO_ID,
        data.PERIODO_ANIO,
        data.COLEGIO_ID,
      );
      
      if (!registroActualizado) {
        throw new ApiError(500, "Error al recuperar el registro de apertura actualizado");
      }
      return registroActualizado;
    }

    return await aperturaCajaRepository.create(data);
  },
};