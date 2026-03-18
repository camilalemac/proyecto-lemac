import { WhereOptions } from "sequelize";
import Curso from "../../../models/curso.model";
import Nivel from "../../../models/nivel.model";
import Periodo from "../../../models/periodo.model";

export const cursoRepository = {
  findAllByColegio: async (colegioId: number, periodoId?: number): Promise<Curso[]> => {
    const where: Record<string, unknown> = { COLEGIO_ID: colegioId };
    if (periodoId) where.PERIODO_ID = periodoId;

    return Curso.findAll({
      where: where as WhereOptions,
      include: [
        { model: Nivel, as: "nivel" },
        { model: Periodo, as: "periodo" },
      ],
      order: [
        [{ model: Nivel, as: "nivel" }, "GRADO_MINEDUC", "ASC"],
        ["LETRA", "ASC"],
      ],
    });
  },

  findById: async (cursoId: number, colegioId: number): Promise<Curso | null> => {
    return Curso.findOne({
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: Nivel, as: "nivel" },
        { model: Periodo, as: "periodo" },
      ],
    });
  },

  findByProfesorJefe: async (profesorJefeId: number, colegioId: number): Promise<Curso | null> => {
    return Curso.findOne({
      where: { PROFESOR_JEFE_ID: profesorJefeId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: Nivel, as: "nivel" },
        { model: Periodo, as: "periodo" },
      ],
    });
  },

  findByNivelLetraPeriodo: async (
    nivelId: number,
    letra: string,
    periodoId: number,
    colegioId: number,
  ): Promise<Curso | null> => {
    return Curso.findOne({
      where: {
        NIVEL_ID: nivelId,
        LETRA: letra,
        PERIODO_ID: periodoId,
        COLEGIO_ID: colegioId,
      } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    PERIODO_ID: number;
    NIVEL_ID: number;
    LETRA: string;
    PROFESOR_JEFE_ID: number | null;
  }): Promise<Curso> => {
    return Curso.create(data);
  },

  update: async (
    cursoId: number,
    colegioId: number,
    data: Partial<{
      NIVEL_ID: number;
      LETRA: string;
      PROFESOR_JEFE_ID: number | null;
    }>,
  ): Promise<[number]> => {
    return Curso.update(data, {
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (cursoId: number, colegioId: number): Promise<number> => {
    return Curso.destroy({
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
