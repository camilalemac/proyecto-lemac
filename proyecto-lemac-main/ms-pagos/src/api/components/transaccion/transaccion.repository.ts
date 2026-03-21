import { WhereOptions } from "sequelize";
import Transaccion from "../../../models/transaccion.model";

export const transaccionRepository = {
  /**
   * Registra un pago como evidencia inmutable en la tabla Blockchain.
   * Solo INSERT — nunca UPDATE ni DELETE.
   */
  registrar: async (data: {
    COLEGIO_ID: number;
    COBRO_ID: number;
    MONTO_PAGO: number;
    METODO_PAGO: string;
  }): Promise<Transaccion> => {
    return Transaccion.create(data);
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
