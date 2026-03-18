import { WhereOptions } from "sequelize";
import Concepto from "../../../models/concepto.model";
import Categoria from "../../../models/categoria.model";

export const conceptoRepository = {
  findAllByColegio: async (colegioId: number): Promise<Concepto[]> => {
    return Concepto.findAll({
      where: { COLEGIO_ID: colegioId } as WhereOptions,
      include: [{ model: Categoria, as: "categoria" }],
    });
  },

  findActivos: async (colegioId: number): Promise<Concepto[]> => {
    return Concepto.findAll({
      where: { COLEGIO_ID: colegioId, ACTIVO: true } as WhereOptions,
      include: [{ model: Categoria, as: "categoria" }],
    });
  },

  findById: async (conceptoId: number, colegioId: number): Promise<Concepto | null> => {
    return Concepto.findOne({
      where: { CONCEPTO_ID: conceptoId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [{ model: Categoria, as: "categoria" }],
    });
  },

  findByCodigo: async (codigo: string, colegioId: number): Promise<Concepto | null> => {
    return Concepto.findOne({ where: { CODIGO: codigo, COLEGIO_ID: colegioId } as WhereOptions });
  },

  create: async (data: {
    COLEGIO_ID: number;
    CATEGORIA_ID: number;
    CUENTA_DESTINO_ID: number;
    CODIGO: string;
    NOMBRE: string;
    MONTO_BASE: number;
    TIPO_COBRO: string;
  }): Promise<Concepto> => {
    return Concepto.create(data);
  },

  update: async (
    conceptoId: number,
    colegioId: number,
    data: Partial<{
      NOMBRE: string;
      MONTO_BASE: number;
      TIPO_COBRO: string;
      ACTIVO: boolean;
      CATEGORIA_ID: number;
      CUENTA_DESTINO_ID: number;
    }>,
  ): Promise<[number]> => {
    return Concepto.update(data, {
      where: { CONCEPTO_ID: conceptoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (conceptoId: number, colegioId: number): Promise<number> => {
    return Concepto.destroy({
      where: { CONCEPTO_ID: conceptoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
