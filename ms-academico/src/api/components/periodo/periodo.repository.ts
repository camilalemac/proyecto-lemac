import { WhereOptions } from "sequelize";
import Periodo from "../../../models/periodo.model";

export const periodoRepository = {
  findAllByColegio: async (colegioId: number): Promise<Periodo[]> => {
    return Periodo.findAll({
      where: { COLEGIO_ID: colegioId } as WhereOptions,
      order: [["ANIO", "DESC"]],
    });
  },

  findById: async (periodoId: number, colegioId: number): Promise<Periodo | null> => {
    return Periodo.findOne({
      where: { PERIODO_ID: periodoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findByAnio: async (anio: number, colegioId: number): Promise<Periodo | null> => {
    return Periodo.findOne({
      where: { ANIO: anio, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findVigente: async (colegioId: number): Promise<Periodo | null> => {
    return Periodo.findOne({
      where: { ESTADO: "ACTIVO", COLEGIO_ID: colegioId } as WhereOptions,
      order: [["ANIO", "DESC"]],
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    ANIO: number;
    NOMBRE: string;
    FECHA_INICIO: Date;
    FECHA_FIN: Date;
    ESTADO: string;
  }): Promise<Periodo> => {
    return Periodo.create(data);
  },

  update: async (
    periodoId: number,
    colegioId: number,
    data: Partial<{
      NOMBRE: string;
      FECHA_INICIO: Date;
      FECHA_FIN: Date;
      ESTADO: string;
    }>,
  ): Promise<[number]> => {
    return Periodo.update(data, {
      where: { PERIODO_ID: periodoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (periodoId: number, colegioId: number): Promise<number> => {
    return Periodo.destroy({
      where: { PERIODO_ID: periodoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
