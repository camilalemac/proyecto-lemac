import { exencionRepository } from "./exencion.repository";
import { cuentaCobrarRepository } from "../cuentaCobrar/cuentaCobrar.repository";
import { ApiError } from "../../../utils/ApiError";
import Exencion from "../../../models/exencion.model";
import sequelize from "../../../config/database.config";

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
    
    // Evitamos re-aprobar si ya tiene "S"
    if (aprobado && exencion.CHECK_PROFESOR === "S") {
      throw new ApiError(409, "El profesor ya aprobó esta solicitud");
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

      if (!aprobado) {
        // Rechazo inmediato
        await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADO", t);
      } else if (exencion.CHECK_TESORERO === "S") {
        // Si el profesor aprueba y el tesorero YA había aprobado antes
        await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "APROBADO", t);
      }

      await t.commit();
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
    
    // Evitamos re-aprobar si ya tiene "S"
    if (aprobado && exencion.CHECK_TESORERO === "S") {
      throw new ApiError(409, "El tesorero ya aprobó esta solicitud");
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

      if (!aprobado) {
        // Rechazo inmediato
        await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "RECHAZADO", t);
      } else if (exencion.CHECK_PROFESOR === "S") {
        // Doble llave: Ambos aprobaron, pasa a APROBADO
        await exencionRepository.actualizarEstadoFinal(exencionId, colegioId, "APROBADO", t);
      }

      await t.commit();
      return exencionService.obtenerExencion(exencionId, colegioId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};