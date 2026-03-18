import { WhereOptions } from "sequelize";
import Transaccion, { EstadoTransaccion } from "../../../models/transaccion.model";

export const transaccionRepository = {
  findById: async (transaccionId: number, colegioId: number): Promise<Transaccion | null> => {
    return Transaccion.findOne({
      where: { TRANSACCION_ID: transaccionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findByToken: async (token: string): Promise<Transaccion | null> => {
    return Transaccion.findOne({ where: { TOKEN_PASARELA: token } as WhereOptions });
  },

  create: async (data: {
    COLEGIO_ID: number;
    COBRO_IDS: string;
    MONTO_PAGO: number;
    METODO_PAGO: string;
  }): Promise<Transaccion> => {
    return Transaccion.create(data);
  },

  update: async (
    transaccionId: number,
    data: Partial<{
      ESTADO: EstadoTransaccion;
      TOKEN_PASARELA: string | null;
      URL_PAGO: string | null;
      FECHA_PAGO: Date | null;
    }>,
  ): Promise<[number]> => {
    const [affectedCount] = await Transaccion.update(data, {
      where: { TRANSACCION_ID: transaccionId } as WhereOptions,
    });
    return [affectedCount];
  },
};
