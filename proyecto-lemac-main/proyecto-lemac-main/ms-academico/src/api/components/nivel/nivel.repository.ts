import { WhereOptions } from "sequelize";
import Nivel from "../../../models/nivel.model";

export const nivelRepository = {
  findAllByColegio: async (colegioId: number): Promise<Nivel[]> => {
    return Nivel.findAll({
      where: { COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findById: async (nivelId: number, colegioId: number): Promise<Nivel | null> => {
    return Nivel.findOne({
      where: { NIVEL_ID: nivelId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    NOMBRE: string;
    NOMBRE_CORTO: string;
    GRADO_MINEDUC: number;
  }): Promise<Nivel> => {
    return Nivel.create(data);
  },

  update: async (
    nivelId: number,
    colegioId: number,
    data: Partial<{ NOMBRE: string; NOMBRE_CORTO: string; GRADO_MINEDUC: number }>,
  ): Promise<[number]> => {
    return Nivel.update(data, {
      where: { NIVEL_ID: nivelId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (nivelId: number, colegioId: number): Promise<number> => {
    return Nivel.destroy({
      where: { NIVEL_ID: nivelId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
