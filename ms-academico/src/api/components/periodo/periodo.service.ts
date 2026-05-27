import { periodoRepository } from "./periodo.repository";
import { ApiError } from "../../../utils/ApiError";
import Periodo from "../../../models/periodo.model";

export const periodoService = {
  listarPeriodos: async (colegioId: number): Promise<Periodo[]> => {
    return periodoRepository.findAllByColegio(colegioId);
  },

  obtenerPeriodo: async (periodoId: number, colegioId: number): Promise<Periodo> => {
    const periodo = await periodoRepository.findById(periodoId, colegioId);
    if (!periodo) {
      throw ApiError.notFound(`Período con ID ${periodoId} no encontrado`);
    }
    return periodo;
  },

  obtenerPeriodoVigente: async (colegioId: number): Promise<Periodo> => {
    const periodo = await periodoRepository.findVigente(colegioId);
    if (!periodo) {
      throw ApiError.notFound("No existe un período académico activo para este colegio");
    }
    return periodo;
  },

  crearPeriodo: async (data: {
    COLEGIO_ID: number;
    ANIO: number;
    NOMBRE: string;
    FECHA_INICIO: Date;
    FECHA_FIN: Date;
  }): Promise<Periodo> => {
    const periodoExistente = await periodoRepository.findByAnio(data.ANIO, data.COLEGIO_ID);
    if (periodoExistente) {
      throw ApiError.conflict(`Ya existe un período para el año ${data.ANIO} en este colegio`);
    }

    return periodoRepository.create({ ...data, ESTADO: "ACTIVO" });
  },

  actualizarPeriodo: async (
    periodoId: number,
    colegioId: number,
    data: Partial<{
      NOMBRE: string;
      FECHA_INICIO: Date;
      FECHA_FIN: Date;
      ESTADO: string;
    }>,
  ): Promise<Periodo> => {
    const [filasAfectadas] = await periodoRepository.update(periodoId, colegioId, data);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Período con ID ${periodoId} no encontrado`);
    }
    return periodoService.obtenerPeriodo(periodoId, colegioId);
  },

  eliminarPeriodo: async (periodoId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await periodoRepository.softDelete(periodoId, colegioId);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Período con ID ${periodoId} no encontrado`);
    }
  },
};
