import { WhereOptions } from "sequelize";
import AperturaCaja from "../../../models/aperturaCaja.model";

export const aperturaCajaRepository = {
  findByCursoAndAnio: async (
    cursoId: number,
    periodoAnio: number,
    colegioId: number,
  ): Promise<AperturaCaja | null> => {
    return AperturaCaja.findOne({
      where: { CURSO_ID: cursoId, PERIODO_ANIO: periodoAnio, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number;
    PERIODO_ANIO: number;
    MONTO_APERTURA: number;
    CREADO_POR: string | null;
  }): Promise<AperturaCaja> => {
    return AperturaCaja.create(data);
  },

  updateMonto: async (
    aperturaId: number,
    colegioId: number,
    data: { MONTO_APERTURA: number; CREADO_POR: string | null },
  ): Promise<[number]> => {
    return AperturaCaja.update(data, {
      where: { APERTURA_ID: aperturaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};