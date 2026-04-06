import { WhereOptions, Transaction } from "sequelize";
import Exencion from "../../../models/exencion.model";
import CuentaCobrar from "../../../models/cuentaCobrar.model";

export const exencionRepository = {
  findAllByColegio: async (colegioId: number): Promise<Exencion[]> => {
    return Exencion.findAll({
      where: { COLEGIO_ID: colegioId } as WhereOptions,
      include: [{ model: CuentaCobrar, as: "cobro" }],
      order: [["FECHA_SOLICITUD", "DESC"]],
    });
  },

  findPendientes: async (colegioId: number): Promise<Exencion[]> => {
    return Exencion.findAll({
      where: { COLEGIO_ID: colegioId, ESTADO_FINAL: "PENDIENTE" } as WhereOptions,
      include: [{ model: CuentaCobrar, as: "cobro" }],
      order: [["FECHA_SOLICITUD", "ASC"]],
    });
  },

  findById: async (exencionId: number, colegioId: number): Promise<Exencion | null> => {
    return Exencion.findOne({
      where: { EXENCION_ID: exencionId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [{ model: CuentaCobrar, as: "cobro" }],
    });
  },

  findByCobro: async (cobroId: number, colegioId: number): Promise<Exencion | null> => {
    return Exencion.findOne({
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    COBRO_ID: number;
    MOTIVO: string;
  }): Promise<Exencion> => {
    return Exencion.create(data);
  },

  registrarRevisionProfesor: async (
    exencionId: number,
    colegioId: number,
    check: string,
    userId: number,
    transaction?: Transaction, // <-- Nuevo parámetro
  ): Promise<[number]> => {
    return Exencion.update(
      { CHECK_PROFESOR: check, FECHA_PROFESOR: new Date(), USER_PROFESOR: userId },
      { where: { EXENCION_ID: exencionId, COLEGIO_ID: colegioId } as WhereOptions, transaction },
    );
  },

  registrarRevisionTesorero: async (
    exencionId: number,
    colegioId: number,
    check: string,
    userId: number,
    observacion: string | null,
    transaction?: Transaction, // <-- Nuevo parámetro
  ): Promise<[number]> => {
    return Exencion.update(
      {
        CHECK_TESORERO: check,
        FECHA_TESORERO: new Date(),
        USER_TESORERO: userId,
        OBSERVACION_RECHAZO: observacion,
      },
      { where: { EXENCION_ID: exencionId, COLEGIO_ID: colegioId } as WhereOptions, transaction },
    );
  },

  actualizarEstadoFinal: async (
    exencionId: number,
    colegioId: number,
    estadoFinal: "APROBADO" | "RECHAZADO",
    transaction?: Transaction, // <-- Nuevo parámetro
  ): Promise<[number]> => {
    return Exencion.update(
      { ESTADO_FINAL: estadoFinal },
      { where: { EXENCION_ID: exencionId, COLEGIO_ID: colegioId } as WhereOptions, transaction },
    );
  },
};
