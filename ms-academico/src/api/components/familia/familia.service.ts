import { familiaRepository } from "./familia.repository";
import { ApiError } from "../../../utils/ApiError";
import Familia from "../../../models/familia.model";

export const familiaService = {
  obtenerFamiliaDelAlumno: async (alumnoId: number, colegioId: number): Promise<Familia[]> => {
    return familiaRepository.findAllByAlumno(alumnoId, colegioId);
  },

  // ✅ MODIFICADO: Cambiamos Promise<Familia[]> por Promise<any[]>
  obtenerHijosDelApoderado: async (apoderadoId: number, colegioId: number): Promise<any[]> => {
    return familiaRepository.findAllByApoderado(apoderadoId, colegioId);
  },

  obtenerRelacion: async (relacionId: number, colegioId: number): Promise<Familia> => {
    const relacion = await familiaRepository.findById(relacionId, colegioId);
    if (!relacion) throw new ApiError(404, `Relación familiar con ID ${relacionId} no encontrada`);
    return relacion;
  },

  vincularApoderadoAlumno: async (data: {
    COLEGIO_ID: number;
    ALUMNO_ID: number;
    APODERADO_ID: number;
    TIPO_RELACION: string;
    ES_APODERADO_ACAD: string;
    ES_TITULAR_FINAN: string;
    AUTORIZADO_RETIRO: string;
  }): Promise<Familia> => {
    const relacionExistente = await familiaRepository.findByAlumnoApoderado(
      data.ALUMNO_ID,
      data.APODERADO_ID,
      data.COLEGIO_ID,
    );
    if (relacionExistente)
      throw new ApiError(409, "Ya existe una relación entre este apoderado y el alumno");

    if (data.ES_TITULAR_FINAN === "S") {
      const titularActual = await familiaRepository.findTitularFinanciero(
        data.ALUMNO_ID,
        data.COLEGIO_ID,
      );
      if (titularActual)
        throw new ApiError(409, "El alumno ya tiene un titular financiero asignado");
    }

    return familiaRepository.create(data);
  },

  actualizarRelacion: async (
    relacionId: number,
    colegioId: number,
    data: Partial<{
      TIPO_RELACION: string;
      ES_APODERADO_ACAD: string;
      ES_TITULAR_FINAN: string;
      AUTORIZADO_RETIRO: string;
    }>,
  ): Promise<Familia> => {
    const relacion = await familiaRepository.findById(relacionId, colegioId);
    if (!relacion) throw new ApiError(404, `Relación familiar con ID ${relacionId} no encontrada`);

    if (data.ES_TITULAR_FINAN === "S") {
      const titularActual = await familiaRepository.findTitularFinanciero(
        relacion.ALUMNO_ID,
        colegioId,
      );
      if (titularActual && titularActual.RELACION_ID !== relacionId) {
        throw new ApiError(409, "El alumno ya tiene un titular financiero asignado");
      }
    }

    const [filasAfectadas] = await familiaRepository.update(relacionId, colegioId, data);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Relación familiar con ID ${relacionId} no encontrada`);
    return familiaService.obtenerRelacion(relacionId, colegioId);
  },

  desvincularRelacion: async (relacionId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await familiaRepository.softDelete(relacionId, colegioId);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Relación familiar con ID ${relacionId} no encontrada`);
  },
};
