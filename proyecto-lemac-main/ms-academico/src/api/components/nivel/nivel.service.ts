import { nivelRepository } from "./nivel.repository";
import { ApiError } from "../../../utils/ApiError";
import Nivel from "../../../models/nivel.model";

export const nivelService = {
  listarNiveles: async (colegioId: number): Promise<Nivel[]> => {
    return nivelRepository.findAllByColegio(colegioId);
  },

  obtenerNivel: async (nivelId: number, colegioId: number): Promise<Nivel> => {
    const nivel = await nivelRepository.findById(nivelId, colegioId);
    if (!nivel) {
      throw ApiError.notFound(`Nivel con ID ${nivelId} no encontrado`);
    }
    return nivel;
  },

  crearNivel: async (data: {
    COLEGIO_ID: number;
    NOMBRE: string;
    NOMBRE_CORTO: string;
    GRADO_MINEDUC: number;
  }): Promise<Nivel> => {
    return nivelRepository.create(data);
  },

  actualizarNivel: async (
    nivelId: number,
    colegioId: number,
    data: Partial<{ NOMBRE: string; NOMBRE_CORTO: string; GRADO_MINEDUC: number }>,
  ): Promise<Nivel> => {
    const [filasAfectadas] = await nivelRepository.update(nivelId, colegioId, data);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Nivel con ID ${nivelId} no encontrado`);
    }
    return nivelService.obtenerNivel(nivelId, colegioId);
  },

  eliminarNivel: async (nivelId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await nivelRepository.softDelete(nivelId, colegioId);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Nivel con ID ${nivelId} no encontrado`);
    }
  },
};
