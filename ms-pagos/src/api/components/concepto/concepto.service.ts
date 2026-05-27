import { conceptoRepository } from "./concepto.repository";
import { categoriaRepository } from "../categoria/categoria.repository";
import { ApiError } from "../../../utils/ApiError";
import Concepto from "../../../models/concepto.model";

export const conceptoService = {
  listarConceptos: async (colegioId: number): Promise<Concepto[]> => {
    return conceptoRepository.findAllByColegio(colegioId);
  },

  listarConceptosActivos: async (colegioId: number): Promise<Concepto[]> => {
    return conceptoRepository.findActivos(colegioId);
  },

  obtenerConcepto: async (conceptoId: number, colegioId: number): Promise<Concepto> => {
    const concepto = await conceptoRepository.findById(conceptoId, colegioId);
    if (!concepto) throw new ApiError(404, `Concepto con ID ${conceptoId} no encontrado`);
    return concepto;
  },

  crearConcepto: async (data: {
    COLEGIO_ID: number;
    CATEGORIA_ID: number;
    CUENTA_DESTINO_ID: number;
    CODIGO: string;
    NOMBRE: string;
    MONTO_BASE: number;
    TIPO_COBRO: string;
  }): Promise<Concepto> => {
    const categoriaExistente = await categoriaRepository.findById(
      data.CATEGORIA_ID,
      data.COLEGIO_ID,
    );
    if (!categoriaExistente)
      throw new ApiError(400, `La categoría con ID ${data.CATEGORIA_ID} no existe`);

    const codigoExistente = await conceptoRepository.findByCodigo(data.CODIGO, data.COLEGIO_ID);
    if (codigoExistente)
      throw new ApiError(409, `Ya existe un concepto con el código "${data.CODIGO}"`);

    return conceptoRepository.create(data);
  },

  actualizarConcepto: async (
    conceptoId: number,
    colegioId: number,
    data: Partial<{
      NOMBRE: string;
      MONTO_BASE: number;
      TIPO_COBRO: string;
      ACTIVO: boolean;
      CATEGORIA_ID: number;
      CUENTA_DESTINO_ID: number;
    }>,
  ): Promise<Concepto> => {
    const [filasAfectadas] = await conceptoRepository.update(conceptoId, colegioId, data);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Concepto con ID ${conceptoId} no encontrado`);
    return conceptoService.obtenerConcepto(conceptoId, colegioId);
  },

  eliminarConcepto: async (conceptoId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await conceptoRepository.softDelete(conceptoId, colegioId);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Concepto con ID ${conceptoId} no encontrado`);
  },
};
