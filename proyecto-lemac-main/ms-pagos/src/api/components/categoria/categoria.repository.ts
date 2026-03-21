import { WhereOptions } from "sequelize";
import Categoria from "../../../models/categoria.model";

export const categoriaRepository = {
  findAllByColegio: async (colegioId: number): Promise<Categoria[]> => {
    return Categoria.findAll({ where: { COLEGIO_ID: colegioId } as WhereOptions });
  },

  findById: async (categoriaId: number, colegioId: number): Promise<Categoria | null> => {
    return Categoria.findOne({
      where: { CATEGORIA_ID: categoriaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findByNombre: async (nombre: string, colegioId: number): Promise<Categoria | null> => {
    return Categoria.findOne({ where: { NOMBRE: nombre, COLEGIO_ID: colegioId } as WhereOptions });
  },

  create: async (data: {
    COLEGIO_ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
  }): Promise<Categoria> => {
    return Categoria.create(data);
  },

  update: async (
    categoriaId: number,
    colegioId: number,
    data: Partial<{ NOMBRE: string; DESCRIPCION: string | null }>,
  ): Promise<[number]> => {
    return Categoria.update(data, {
      where: { CATEGORIA_ID: categoriaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (categoriaId: number, colegioId: number): Promise<number> => {
    return Categoria.destroy({
      where: { CATEGORIA_ID: categoriaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
