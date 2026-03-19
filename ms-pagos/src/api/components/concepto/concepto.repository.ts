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
      // CORRECCIÓN: Cambiamos true por 'S' para que coincida con Oracle
      where: { COLEGIO_ID: colegioId, ACTIVO: "S" } as WhereOptions,
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
    // 1. Mapeamos la data para convertir el boolean a 'S'/'N' para Oracle
    const datosActualizar: any = { ...data };
    if (data.ACTIVO !== undefined) {
      datosActualizar.ACTIVO = data.ACTIVO ? "S" : "N";
    }

    // 2. Usamos desestructuración para sacar solo el primer valor (affectedCount)
    // y descartar el segundo (affectedRows) que causa el problema de tipos
    const [affectedCount] = await Concepto.update(datosActualizar, {
      where: { CONCEPTO_ID: conceptoId, COLEGIO_ID: colegioId } as WhereOptions,
    });

    // 3. Devolvemos exactamente lo que pide la firma de la función: una tupla con un número
    return [affectedCount];
  },

  softDelete: async (conceptoId: number, colegioId: number): Promise<number> => {
    return Concepto.destroy({
      where: { CONCEPTO_ID: conceptoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
