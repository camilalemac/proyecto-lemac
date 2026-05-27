import { categoriaRepository } from "./categoria.repository";
import { ApiError } from "../../../utils/ApiError";
import Categoria from "../../../models/categoria.model";

export const categoriaService = {
  listarCategorias: async (colegioId: number): Promise<Categoria[]> => {
    return categoriaRepository.findAllByColegio(colegioId);
  },

  obtenerCategoria: async (categoriaId: number, colegioId: number): Promise<Categoria> => {
    const categoria = await categoriaRepository.findById(categoriaId, colegioId);
    if (!categoria) throw new ApiError(404, `Categoría con ID ${categoriaId} no encontrada`);
    return categoria;
  },

  crearCategoria: async (data: {
    COLEGIO_ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
  }): Promise<Categoria> => {
    const existente = await categoriaRepository.findByNombre(data.NOMBRE, data.COLEGIO_ID);
    if (existente)
      throw new ApiError(409, `Ya existe una categoría con el nombre "${data.NOMBRE}"`);
    return categoriaRepository.create(data);
  },

  actualizarCategoria: async (
    categoriaId: number,
    colegioId: number,
    data: Partial<{ NOMBRE: string; DESCRIPCION: string | null }>,
  ): Promise<Categoria> => {
    const [filasAfectadas] = await categoriaRepository.update(categoriaId, colegioId, data);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Categoría con ID ${categoriaId} no encontrada`);
    return categoriaService.obtenerCategoria(categoriaId, colegioId);
  },

  eliminarCategoria: async (categoriaId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await categoriaRepository.softDelete(categoriaId, colegioId);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Categoría con ID ${categoriaId} no encontrada`);
  },
};
