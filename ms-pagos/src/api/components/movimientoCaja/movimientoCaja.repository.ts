import { WhereOptions } from "sequelize";
import MovimientoCaja, { TipoMovimiento } from "../../../models/movimientoCaja.model";
import CuentaBancaria from "../../../models/cuentaBancaria.model";
import Categoria from "../../../models/categoria.model";

export const movimientoCajaRepository = {
  findAllByCuenta: async (cuentaId: number, colegioId: number): Promise<MovimientoCaja[]> => {
    return MovimientoCaja.findAll({
      where: { CUENTA_ID: cuentaId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: CuentaBancaria, as: "cuentaBancaria" },
        { model: Categoria, as: "categoria" },
      ],
      order: [["FECHA_MOVIMIENTO", "DESC"]],
    });
  },

  findById: async (movimientoId: number, colegioId: number): Promise<MovimientoCaja | null> => {
    return MovimientoCaja.findOne({
      where: { MOVIMIENTO_ID: movimientoId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: CuentaBancaria, as: "cuentaBancaria" },
        { model: Categoria, as: "categoria" },
      ],
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    CUENTA_ID: number;
    RESPONSABLE_ID: number;
    CATEGORIA_ID: number;
    TIPO_MOVIMIENTO: TipoMovimiento;
    GLOSA: string;
    MONTO: number;
    COMPROBANTE_URL: string | null;
    FECHA_MOVIMIENTO: Date;
  }): Promise<MovimientoCaja> => {
    return MovimientoCaja.create(data);
  },

  softDelete: async (movimientoId: number, colegioId: number): Promise<number> => {
    return MovimientoCaja.destroy({
      where: { MOVIMIENTO_ID: movimientoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
