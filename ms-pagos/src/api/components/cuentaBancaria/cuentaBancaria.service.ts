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
      throw new ApiError(404, `No existe cuenta bancaria activa para el curso ID ${cursoId}`);
    return cuenta;
  },

  crearCuenta: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number | null; // <-- Añadimos "| null" aquí
    NOMBRE_CUENTA: string;
    BANCO: string | null;
  }): Promise<CuentaBancaria> => {
    // Si la cuenta es de todo el colegio (CURSO_ID es null), podemos omitir la validación de cuenta duplicada por curso
    if (data.CURSO_ID !== null) {
      const cuentaExistente = await cuentaBancariaRepository.findByCurso(
        data.CURSO_ID,
        data.COLEGIO_ID,
      );
      if (cuentaExistente) {
        throw new ApiError(
          409,
          `Ya existe una cuenta bancaria activa para el curso ID ${data.CURSO_ID}`,
        );
      }
    }
    return cuentaBancariaRepository.create(data);
  },

  /**
   * Apertura de caja: traspasa el saldo del año anterior al año actual.
   * Registra un movimiento de egreso en la cuenta origen y uno de ingreso
   * en la cuenta destino — el trigger Oracle actualiza los saldos automáticamente.
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
    // Los movimientos de apertura de caja se registran desde movimientoCaja
    return { saldoTrasladado: saldoOrigen };
  },

  actualizarCuenta: async (
    cuentaId: number,
    colegioId: number,
    data: Partial<{ NOMBRE_CUENTA: string; BANCO: string; ACTIVO: string }>,
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
