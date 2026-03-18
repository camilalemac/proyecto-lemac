import sequelize from "../../../config/database.config";
import { movimientoCajaRepository } from "./movimientoCaja.repository";
import { cuentaBancariaRepository } from "../cuentaBancaria/cuentaBancaria.repository";
import { ApiError } from "../../../utils/ApiError";
import MovimientoCaja, { TipoMovimiento } from "../../../models/movimientoCaja.model";
import MovimientoCajaModel from "../../../models/movimientoCaja.model";
import CuentaBancariaModel from "../../../models/cuentaBancaria.model";

export const movimientoCajaService = {
  listarMovimientosPorCuenta: async (
    cuentaId: number,
    colegioId: number,
  ): Promise<MovimientoCaja[]> => {
    return movimientoCajaRepository.findAllByCuenta(cuentaId, colegioId);
  },

  obtenerMovimiento: async (movimientoId: number, colegioId: number): Promise<MovimientoCaja> => {
    const movimiento = await movimientoCajaRepository.findById(movimientoId, colegioId);
    if (!movimiento) throw new ApiError(404, `Movimiento con ID ${movimientoId} no encontrado`);
    return movimiento;
  },

  registrarMovimiento: async (data: {
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
    const cuenta = await cuentaBancariaRepository.findById(data.CUENTA_ID, data.COLEGIO_ID);
    if (!cuenta) throw new ApiError(404, `Cuenta bancaria con ID ${data.CUENTA_ID} no encontrada`);
    if (!cuenta.ACTIVO) throw new ApiError(409, "La cuenta bancaria no está activa");

    if (data.TIPO_MOVIMIENTO === "EGRESO") {
      const saldoActual = Number(cuenta.SALDO_ACTUAL);
      if (saldoActual < data.MONTO)
        throw new ApiError(409, `Saldo insuficiente. Saldo actual: $${saldoActual}`);
    }

    return await sequelize.transaction(async (t) => {
      const movimiento = await MovimientoCajaModel.create(data, { transaction: t });
      const incremento = data.TIPO_MOVIMIENTO === "INGRESO" ? data.MONTO : -data.MONTO;
      const nuevoSaldo = Number(cuenta.SALDO_ACTUAL) + incremento;
      await CuentaBancariaModel.update(
        { SALDO_ACTUAL: nuevoSaldo },
        { where: { CUENTA_ID: data.CUENTA_ID }, transaction: t },
      );
      return movimiento;
    });
  },

  eliminarMovimiento: async (movimientoId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await movimientoCajaRepository.softDelete(movimientoId, colegioId);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Movimiento con ID ${movimientoId} no encontrado`);
  },
};
