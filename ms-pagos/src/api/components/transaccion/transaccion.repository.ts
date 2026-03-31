import { WhereOptions, Transaction } from "sequelize";
import Transaccion from "../../../models/transaccion.model";

export const transaccionRepository = {
  registrar: async (
    data: {
      COLEGIO_ID: number;
      COBRO_ID: number;
      MONTO_PAGO: number;
      METODO_PAGO: string;
    },
    transaction?: Transaction,
  ): Promise<Transaccion> => {
    return Transaccion.create(data, { transaction });
  },

  // NUEVO: Para insertar múltiples evidencias inmutables en un solo pago
  registrarMultiples: async (
    data: {
      COLEGIO_ID: number;
      COBRO_ID: number;
      MONTO_PAGO: number;
      METODO_PAGO: string;
    }[],
    transaction?: Transaction,
  ): Promise<Transaccion[]> => {
    return Transaccion.bulkCreate(data, { transaction });
  },

  findByCobro: async (cobroId: number, colegioId: number): Promise<Transaccion | null> => {
    return Transaccion.findOne({
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findAllByColegio: async (colegioId: number): Promise<Transaccion[]> => {
    return Transaccion.findAll({
      where: { COLEGIO_ID: colegioId } as WhereOptions,
      order: [["FECHA_PAGO", "DESC"]],
    });
  },
};
