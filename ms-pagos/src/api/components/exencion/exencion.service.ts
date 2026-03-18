import { exencionRepository } from "./exencion.repository";
import { cuentaCobrarRepository } from "../cuentaCobrar/cuentaCobrar.repository";
import { ApiError } from "../../../utils/ApiError";
import Exencion from "../../../models/exencion.model";

export const exencionService = {
  listarExenciones: async (colegioId: number): Promise<Exencion[]> => {
    return exencionRepository.findAllByColegio(colegioId);
  },

  listarPendientes: async (colegioId: number): Promise<Exencion[]> => {
    return exencionRepository.findPendientes(colegioId);
  },

  obtenerExencion: async (exencionId: number, colegioId: number): Promise<Exencion> => {
    const exencion = await exencionRepository.findById(exencionId, colegioId);
    if (!exencion)
      throw new ApiError(404, `Solicitud de exención con ID ${exencionId} no encontrada`);
    return exencion;
  },

  solicitarExencion: async (data: {
    COLEGIO_ID: number;
    COBRO_ID: number;
    MOTIVO: string;
  }): Promise<Exencion> => {
    const cobros = await cuentaCobrarRepository.findByIds([data.COBRO_ID], data.COLEGIO_ID);
    if (cobros.length === 0) throw new ApiError(404, `El cobro con ID ${data.COBRO_ID} no existe`);
    if (cobros[0].ESTADO !== "PENDIENTE")
      throw new ApiError(409, "Solo se pueden eximir cobros en estado PENDIENTE");

    const exencionExistente = await exencionRepository.findByCobro(data.COBRO_ID, data.COLEGIO_ID);
    if (exencionExistente)
      throw new ApiError(409, "Ya existe una solicitud de exención para este cobro");

    return exencionRepository.create(data);
  },

  /**
   * Flujo de aprobación:
   * 1. El profesor jefe revisa y aprueba o rechaza.
   * 2. El tesorero de apoderados revisa y aprueba o rechaza.
   * 3. Solo si AMBOS aprueban, el estado final es APROBADA y el cobro se marca como EXENTO.
   * Si cualquiera rechaza, el estado final es RECHAZADA.
   */
  revisarComoProfesor: async (
    exencionId: number,
    colegioId: number,
    aprobado: boolean,
    userId: number,
  ): Promise<Exencion> => {
    const exencion = await exencionService.obtenerExencion(exencionId, colegioId);
    if (exencion.ESTADO_FINAL !== "PENDIENTE")
      throw new ApiError(409, "Esta solicitud ya fue resuelta");
    if (exencion.CHECK_PROFESOR !== null)
      throw new ApiError(409, "El profesor ya revisó esta solicitud");

    await exencionRepository.registrarRevisionProfesor(exencionId, colegioId, aprobado, userId);

    if (!aprobado) {
      await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADA");
    }

    return exencionService.obtenerExencion(exencionId, colegioId);
  },

  revisarComoTesorero: async (
    exencionId: number,
    colegioId: number,
    aprobado: boolean,
    userId: number,
    observacion: string | null,
  ): Promise<Exencion> => {
    const exencion = await exencionService.obtenerExencion(exencionId, colegioId);
    if (exencion.ESTADO_FINAL !== "PENDIENTE")
      throw new ApiError(409, "Esta solicitud ya fue resuelta");
    if (exencion.CHECK_PROFESOR === null)
      throw new ApiError(409, "El profesor aún no ha revisado esta solicitud");
    if (exencion.CHECK_PROFESOR === false)
      throw new ApiError(409, "Esta solicitud ya fue rechazada por el profesor");
    if (exencion.CHECK_TESORERO !== null)
      throw new ApiError(409, "El tesorero ya revisó esta solicitud");

    await exencionRepository.registrarRevisionTesorero(
      exencionId,
      colegioId,
      aprobado,
      userId,
      observacion,
    );

    if (aprobado) {
      await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "APROBADA");
      await cuentaCobrarRepository.updateEstado(exencion.COBRO_ID, colegioId, "EXENTO");
    } else {
      await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADA");
    }

    return exencionService.obtenerExencion(exencionId, colegioId);
  },
};
