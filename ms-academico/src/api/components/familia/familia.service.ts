import { familiaRepository } from "./familia.repository";
import { ApiError } from "../../../utils/ApiError";
import Familia from "../../../models/familia.model";

export const familiaService = {
  obtenerFamiliaDelAlumno: async (alumnoId: number, colegioId: number): Promise<Familia[]> => {
    return familiaRepository.findAllByAlumno(alumnoId, colegioId);
  },

  /**
   * Retorna todos los alumnos (hijos/cargas) vinculados a un apoderado.
   * Usado por el apoderado para ver su grupo familiar y elegir
   * qué cuotas de qué hijo quiere pagar.
   */
  obtenerHijosDelApoderado: async (apoderadoId: number, colegioId: number): Promise<Familia[]> => {
    return familiaRepository.findAllByApoderado(apoderadoId, colegioId);
  },

  obtenerRelacion: async (relacionId: number, colegioId: number): Promise<Familia> => {
    const relacion = await familiaRepository.findById(relacionId, colegioId);
    if (!relacion) {
      throw ApiError.notFound(`Relación familiar con ID ${relacionId} no encontrada`);
    }
    return relacion;
  },

  /**
   * Vincula un apoderado a un alumno.
   * Reglas de negocio:
   * - Solo puede existir un titular financiero por alumno.
   * - Solo puede existir un apoderado académico principal por alumno.
   * - No se puede duplicar la relación entre el mismo apoderado y alumno.
   */
  vincularApoderadoAlumno: async (data: {
    COLEGIO_ID: number;
    ALUMNO_ID: number;
    APODERADO_ID: number;
    TIPO_RELACION: string;
    ES_APODERADO_ACAD: boolean;
    ES_TITULAR_FINAN: boolean;
    AUTORIZADO_RETIRO: boolean;
  }): Promise<Familia> => {
    // Validar que no exista ya la relación
    const relacionExistente = await familiaRepository.findByAlumnoApoderado(
      data.ALUMNO_ID,
      data.APODERADO_ID,
      data.COLEGIO_ID,
    );
    if (relacionExistente) {
      throw ApiError.conflict("Ya existe una relación entre este apoderado y el alumno");
    }

    // Validar unicidad del titular financiero
    if (data.ES_TITULAR_FINAN) {
      const titularActual = await familiaRepository.findTitularFinanciero(
        data.ALUMNO_ID,
        data.COLEGIO_ID,
      );
      if (titularActual) {
        throw ApiError.conflict(
          "El alumno ya tiene un titular financiero asignado. Desvincule primero al titular actual.",
        );
      }
    }

    return familiaRepository.create(data);
  },

  actualizarRelacion: async (
    relacionId: number,
    colegioId: number,
    data: Partial<{
      TIPO_RELACION: string;
      ES_APODERADO_ACAD: boolean;
      ES_TITULAR_FINAN: boolean;
      AUTORIZADO_RETIRO: boolean;
    }>,
  ): Promise<Familia> => {
    const relacion = await familiaRepository.findById(relacionId, colegioId);
    if (!relacion) {
      throw ApiError.notFound(`Relación familiar con ID ${relacionId} no encontrada`);
    }

    // Si se intenta asignar como titular financiero, verificar unicidad
    if (data.ES_TITULAR_FINAN === true) {
      const titularActual = await familiaRepository.findTitularFinanciero(
        relacion.ALUMNO_ID,
        colegioId,
      );
      if (titularActual && titularActual.RELACION_ID !== relacionId) {
        throw ApiError.conflict(
          "El alumno ya tiene un titular financiero asignado. Desvincule primero al titular actual.",
        );
      }
    }

    const [filasAfectadas] = await familiaRepository.update(relacionId, colegioId, data);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Relación familiar con ID ${relacionId} no encontrada`);
    }

    return familiaService.obtenerRelacion(relacionId, colegioId);
  },

  desvincularRelacion: async (relacionId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await familiaRepository.softDelete(relacionId, colegioId);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Relación familiar con ID ${relacionId} no encontrada`);
    }
  },
};
