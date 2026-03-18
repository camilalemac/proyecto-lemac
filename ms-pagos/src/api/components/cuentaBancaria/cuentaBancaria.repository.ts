import { WhereOptions } from "sequelize";
import CuentaBancaria from "../../../models/cuentaBancaria.model";

export const cuentaBancariaRepository = {
  findAllByColegio: async (colegioId: number): Promise<CuentaBancaria[]> => {
    return CuentaBancaria.findAll({ where: { COLEGIO_ID: colegioId } as WhereOptions });
  },

  findById: async (cuentaId: number, colegioId: number): Promise<CuentaBancaria | null> => {
    return CuentaBancaria.findOne({
      where: { CUENTA_ID: cuentaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findByCurso: async (cursoId: number, colegioId: number): Promise<CuentaBancaria | null> => {
    return CuentaBancaria.findOne({
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId, ACTIVO: true } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number | null;
    NOMBRE_CUENTA: string;
    BANCO: string;
  }): Promise<CuentaBancaria> => {
    return CuentaBancaria.create(data);
  },

  update: async (
    cuentaId: number,
    colegioId: number,
    data: Partial<{ NOMBRE_CUENTA: string; BANCO: string; ACTIVO: boolean }>,
  ): Promise<[number]> => {
    return CuentaBancaria.update(data, {
      where: { CUENTA_ID: cuentaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  actualizarSaldo: async (
    cuentaId: number,
    colegioId: number,
    incremento: number,
  ): Promise<void> => {
    const cuenta = await CuentaBancaria.findOne({
      where: { CUENTA_ID: cuentaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
    if (cuenta) {
      const nuevoSaldo = Number(cuenta.SALDO_ACTUAL) + incremento;
      await CuentaBancaria.update(
        { SALDO_ACTUAL: nuevoSaldo },
        { where: { CUENTA_ID: cuentaId } as WhereOptions },
      );
    }
  },

  softDelete: async (cuentaId: number, colegioId: number): Promise<number> => {
    return CuentaBancaria.destroy({
      where: { CUENTA_ID: cuentaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
