import { cuentaBancariaRepository } from "./cuentaBancaria.repository";
import { ApiError } from "../../../utils/ApiError";
import CuentaBancaria from "../../../models/cuentaBancaria.model";

export const cuentaBancariaService = {
  listarCuentas: async (colegioId: number): Promise<CuentaBancaria[]> => {
    return cuentaBancariaRepository.findAllByColegio(colegioId);
  },

  obtenerCuenta: async (cuentaId: number, colegioId: number): Promise<CuentaBancaria> => {
    const cuenta = await cuentaBancariaRepository.findById(cuentaId, colegioId);
    if (!cuenta) throw new ApiError(404, `Cuenta bancaria con ID ${cuentaId} no encontrada`);
    return cuenta;
  },

  obtenerCuentaPorCurso: async (cursoId: number, colegioId: number): Promise<CuentaBancaria> => {
    const cuenta = await cuentaBancariaRepository.findByCurso(cursoId, colegioId);
    if (!cuenta)
      throw new ApiError(404, `No existe una cuenta bancaria activa para el curso ID ${cursoId}`);
    return cuenta;
  },

  crearCuenta: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number | null;
    NOMBRE_CUENTA: string;
    BANCO: string;
  }): Promise<CuentaBancaria> => {
    if (data.CURSO_ID) {
      const cuentaExistente = await cuentaBancariaRepository.findByCurso(
        data.CURSO_ID,
        data.COLEGIO_ID,
      );
      if (cuentaExistente)
        throw new ApiError(
          409,
          `Ya existe una cuenta bancaria activa para el curso ID ${data.CURSO_ID}`,
        );
    }
    return cuentaBancariaRepository.create(data);
  },

  /**
   * Apertura de caja: traspasa el saldo del año anterior al año actual.
   * El tesorero ejecuta esto al inicio del año escolar.
   */
  abrirCaja: async (
    cuentaOrigenId: number,
    cuentaDestinoId: number,
    colegioId: number,
  ): Promise<{ saldoTrasladado: number }> => {
    const cuentaOrigen = await cuentaBancariaService.obtenerCuenta(cuentaOrigenId, colegioId);
    const saldoOrigen = Number(cuentaOrigen.SALDO_ACTUAL);

    if (saldoOrigen <= 0)
      throw new ApiError(400, "La cuenta de origen no tiene saldo disponible para trasladar");

    await cuentaBancariaRepository.actualizarSaldo(cuentaOrigenId, colegioId, -saldoOrigen);
    await cuentaBancariaRepository.actualizarSaldo(cuentaDestinoId, colegioId, saldoOrigen);

    return { saldoTrasladado: saldoOrigen };
  },

  actualizarCuenta: async (
    cuentaId: number,
    colegioId: number,
    data: Partial<{ NOMBRE_CUENTA: string; BANCO: string; ACTIVO: boolean }>,
  ): Promise<CuentaBancaria> => {
    const [filasAfectadas] = await cuentaBancariaRepository.update(cuentaId, colegioId, data);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Cuenta bancaria con ID ${cuentaId} no encontrada`);
    return cuentaBancariaService.obtenerCuenta(cuentaId, colegioId);
  },

  eliminarCuenta: async (cuentaId: number, colegioId: number): Promise<void> => {
    const cuenta = await cuentaBancariaService.obtenerCuenta(cuentaId, colegioId);
    if (Number(cuenta.SALDO_ACTUAL) !== 0)
      throw new ApiError(409, "No se puede eliminar una cuenta con saldo disponible");
    const filasAfectadas = await cuentaBancariaRepository.softDelete(cuentaId, colegioId);
    if (filasAfectadas === 0)
      throw new ApiError(404, `Cuenta bancaria con ID ${cuentaId} no encontrada`);
  },
};
