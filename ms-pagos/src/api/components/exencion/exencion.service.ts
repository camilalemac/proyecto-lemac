import { exencionRepository } from "./exencion.repository";
import { cuentaCobrarRepository } from "../cuentaCobrar/cuentaCobrar.repository";
import { ApiError } from "../../../utils/ApiError";
import Exencion from "../../../models/exencion.model";
import sequelize from "../../../config/database.config"; // Importamos para transacciones

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
      throw new ApiError(
        409,
        "Solo se pueden solicitar exenciones para cobros en estado PENDIENTE",
      );

    const exencionExistente = await exencionRepository.findByCobro(data.COBRO_ID, data.COLEGIO_ID);
    if (exencionExistente)
      throw new ApiError(409, "Ya existe una solicitud de exención para este cobro");

    // Por defecto, al crear, CHECK_PROFESOR y CHECK_TESORERO suelen ser 'N' o nulos en la BD.
    return exencionRepository.create(data);
  },

  revisarComoProfesor: async (
    exencionId: number,
    colegioId: number,
    aprobado: boolean,
    userId: number,
  ): Promise<Exencion> => {
    const exencion = await exencionService.obtenerExencion(exencionId, colegioId);

    if (exencion.ESTADO_FINAL !== "PENDIENTE") {
      throw new ApiError(409, `Esta solicitud ya fue resuelta (Estado: ${exencion.ESTADO_FINAL})`);
    }
    if (exencion.CHECK_PROFESOR === "S" || exencion.CHECK_PROFESOR === "N") {
      throw new ApiError(409, "El profesor ya emitió una revisión para esta solicitud");
    }

    const t = await sequelize.transaction();

    try {
      const checkValue = aprobado ? "S" : "N";
      await exencionRepository.registrarRevisionProfesor(
        exencionId,
        colegioId,
        checkValue,
        userId,
        t,
      );

      // Si el profesor RECHAZA, matamos la solicitud de inmediato.
      if (!aprobado) {
        await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADO", t);
      }

      await t.commit();

      // Retornamos la exención fresca desde la BD (por si el trigger actuó)
      return exencionService.obtenerExencion(exencionId, colegioId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  revisarComoTesorero: async (
    exencionId: number,
    colegioId: number,
    aprobado: boolean,
    userId: number,
    observacion: string | null,
  ): Promise<Exencion> => {
    const exencion = await exencionService.obtenerExencion(exencionId, colegioId);

    if (exencion.ESTADO_FINAL !== "PENDIENTE") {
      throw new ApiError(409, `Esta solicitud ya fue resuelta (Estado: ${exencion.ESTADO_FINAL})`);
    }
    if (exencion.CHECK_TESORERO === "S" || exencion.CHECK_TESORERO === "N") {
      throw new ApiError(409, "El tesorero ya emitió una revisión para esta solicitud");
    }

    const t = await sequelize.transaction();

    try {
      const checkValue = aprobado ? "S" : "N";
      await exencionRepository.registrarRevisionTesorero(
        exencionId,
        colegioId,
        checkValue,
        userId,
        observacion,
        t,
      );

      // Si el tesorero RECHAZA, matamos la solicitud de inmediato.
      if (!aprobado) {
        await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADO", t);
      }

      await t.commit();

      // Retornamos la exención fresca desde la BD (por si el trigger actuó)
      return exencionService.obtenerExencion(exencionId, colegioId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};
