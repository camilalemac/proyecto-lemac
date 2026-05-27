import { WhereOptions } from "sequelize";
import MetodoPago from "../../../models/metodoPago.model";

export const metodoPagoRepository = {
  findAllByColegio: async (colegioId: number): Promise<MetodoPago[]> => {
    return MetodoPago.findAll({ where: { COLEGIO_ID: colegioId } as WhereOptions });
  },

  findActivos: async (colegioId: number): Promise<MetodoPago[]> => {
    return MetodoPago.findAll({
      where: { COLEGIO_ID: colegioId, ESTADO: "ACTIVO" } as WhereOptions,
    });
  },

  findById: async (metodoId: number, colegioId: number): Promise<MetodoPago | null> => {
    return MetodoPago.findOne({
      where: { METODO_ID: metodoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    NOMBRE_METODO: string;
    COMISION_PORCENTAJE: number;
    COMISION_FIJA: number;
    IMPUESTO_PORCENTAJE: number;
  }): Promise<MetodoPago> => {
    return MetodoPago.create(data);
  },

  update: async (
    metodoId: number,
    colegioId: number,
    data: Partial<{
      NOMBRE_METODO: string;
      COMISION_PORCENTAJE: number;
      COMISION_FIJA: number;
      IMPUESTO_PORCENTAJE: number;
      ESTADO: string;
    }>,
  ): Promise<[number]> => {
    return MetodoPago.update(data, {
      where: { METODO_ID: metodoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (metodoId: number, colegioId: number): Promise<number> => {
    return MetodoPago.destroy({
      where: { METODO_ID: metodoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
