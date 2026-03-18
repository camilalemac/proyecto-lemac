import { WhereOptions } from "sequelize";
import Familia from "../../../models/familia.model";

export const familiaRepository = {
  findAllByAlumno: async (alumnoId: number, colegioId: number): Promise<Familia[]> => {
    return Familia.findAll({
      where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findAllByApoderado: async (apoderadoId: number, colegioId: number): Promise<Familia[]> => {
    return Familia.findAll({
      where: { APODERADO_ID: apoderadoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findById: async (relacionId: number, colegioId: number): Promise<Familia | null> => {
    return Familia.findOne({
      where: { RELACION_ID: relacionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findByAlumnoApoderado: async (
    alumnoId: number,
    apoderadoId: number,
    colegioId: number,
  ): Promise<Familia | null> => {
    return Familia.findOne({
      where: {
        ALUMNO_ID: alumnoId,
        APODERADO_ID: apoderadoId,
        COLEGIO_ID: colegioId,
      } as WhereOptions,
    });
  },

  findTitularFinanciero: async (alumnoId: number, colegioId: number): Promise<Familia | null> => {
    return Familia.findOne({
      where: {
        ALUMNO_ID: alumnoId,
        COLEGIO_ID: colegioId,
        ES_TITULAR_FINAN: true,
      } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    ALUMNO_ID: number;
    APODERADO_ID: number;
    TIPO_RELACION: string;
    ES_APODERADO_ACAD: boolean;
    ES_TITULAR_FINAN: boolean;
    AUTORIZADO_RETIRO: boolean;
  }): Promise<Familia> => {
    return Familia.create(data);
  },

  update: async (
    relacionId: number,
    colegioId: number,
    data: Partial<{
      TIPO_RELACION: string;
      ES_APODERADO_ACAD: boolean;
      ES_TITULAR_FINAN: boolean;
      AUTORIZADO_RETIRO: boolean;
    }>,
  ): Promise<[number]> => {
    return Familia.update(data, {
      where: { RELACION_ID: relacionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (relacionId: number, colegioId: number): Promise<number> => {
    return Familia.destroy({
      where: { RELACION_ID: relacionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
