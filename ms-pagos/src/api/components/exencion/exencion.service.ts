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
   * El profesor registra su revisión marcando CHECK_PROFESOR = 'S' o 'N'.
   * El trigger trg_aplicar_exencion en Oracle actualiza ESTADO_FINAL automáticamente
   * cuando ambos checks son 'S'. No necesitamos hacerlo manualmente.
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
    if (exencion.CHECK_PROFESOR === "S")
      throw new ApiError(409, "El profesor ya revisó esta solicitud");

    await exencionRepository.registrarRevisionProfesor(
      exencionId,
      colegioId,
      aprobado ? "S" : "N",
      userId,
    );
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
    if (exencion.CHECK_PROFESOR !== "S")
      throw new ApiError(409, "El profesor aún no ha aprobado esta solicitud");
    if (exencion.CHECK_TESORERO === "S")
      throw new ApiError(409, "El tesorero ya revisó esta solicitud");

    await exencionRepository.registrarRevisionTesorero(
      exencionId,
      colegioId,
      aprobado ? "S" : "N",
      userId,
      observacion,
    );

    // Si el tesorero rechaza, actualizamos ESTADO_FINAL manualmente
    // (el trigger solo actúa cuando ambos son 'S')
    if (!aprobado) {
      await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADO");
    }

    // Si aprobó, el trigger Oracle actualiza ESTADO_FINAL a 'APROBADO' automáticamente
    // y marcará el cobro como EXENTO. No necesitamos hacerlo aquí.

    return exencionService.obtenerExencion(exencionId, colegioId);
  },
};
