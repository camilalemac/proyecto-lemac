import { WhereOptions, Op, QueryTypes } from "sequelize"; // <-- Agregamos QueryTypes
import sequelize from "../../../config/database.config"; // <-- Agregamos tu conexión
import CuentaCobrar, { EstadoCobro } from "../../../models/cuentaCobrar.model";
import Concepto from "../../../models/concepto.model";
import Categoria from "../../../models/categoria.model";

export const cuentaCobrarRepository = {
  findAllByAlumno: async (alumnoId: number, colegioId: number): Promise<CuentaCobrar[]> => {
    return CuentaCobrar.findAll({
      where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: Concepto, as: "concepto", include: [{ model: Categoria, as: "categoria" }] },
      ],
      order: [["FECHA_VENCIMIENTO", "ASC"]],
    });
  },

  findPendientesByAlumno: async (alumnoId: number, colegioId: number): Promise<CuentaCobrar[]> => {
    return CuentaCobrar.findAll({
      where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId, ESTADO: "PENDIENTE" } as WhereOptions,
      include: [
        { model: Concepto, as: "concepto", include: [{ model: Categoria, as: "categoria" }] },
      ],
      order: [["FECHA_VENCIMIENTO", "ASC"]],
    });
  },

  findByIds: async (cobrosIds: number[], colegioId: number): Promise<CuentaCobrar[]> => {
    return CuentaCobrar.findAll({
      where: { COBRO_ID: { [Op.in]: cobrosIds }, COLEGIO_ID: colegioId } as WhereOptions,
      include: [{ model: Concepto, as: "concepto" }],
    });
  },

  findById: async (cobroId: number, colegioId: number): Promise<CuentaCobrar | null> => {
    return CuentaCobrar.findOne({
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: Concepto, as: "concepto", include: [{ model: Categoria, as: "categoria" }] },
      ],
    });
  },

  findByCurso: async (cursoId: number, colegioId: number): Promise<CuentaCobrar[]> => {
    return CuentaCobrar.findAll({
      where: { COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        { model: Concepto, as: "concepto", where: { CUENTA_DESTINO_ID: cursoId } as WhereOptions },
      ],
      order: [["FECHA_VENCIMIENTO", "ASC"]],
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    ALUMNO_ID: number;
    GRUPO_FAMILIAR_ID: number | null;
    APODERADO_ID: number | null;
    CONCEPTO_ID: number;
    DESCRIPCION: string | null;
    NUMERO_CUOTA: number;
    TOTAL_CUOTAS: number;
    MONTO_ORIGINAL: number;
    FECHA_VENCIMIENTO: Date;
  }): Promise<CuentaCobrar> => {
    return CuentaCobrar.create(data);
  },

  updateEstado: async (
    cobroId: number,
    colegioId: number,
    estado: EstadoCobro,
    montoPagado?: number,
  ): Promise<[number]> => {
    const data: Record<string, unknown> = { ESTADO: estado };
    if (montoPagado !== undefined) data.MONTO_PAGADO = montoPagado;
    return CuentaCobrar.update(data, {
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (cobroId: number, colegioId: number): Promise<number> => {
    return CuentaCobrar.destroy({
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  // ✅ NUEVO: La magia para cruzar esquemas y traer a los alumnos listos para cobrarles
  obtenerDatosFinancierosAlumnosPorCurso: async (
    cursoId: number,
    colegioId: number,
  ): Promise<any[]> => {
    const query = `
      SELECT 
        m."ALUMNO_ID",
        u."GRUPO_ID" AS "GRUPO_FAMILIAR_ID",
        f."APODERADO_ID"
      FROM "MS_ACADEMICO"."ACA_MATRICULAS" m
      JOIN "MS_IDENTITY"."IDN_USUARIOS" u ON m."ALUMNO_ID" = u."USER_ID"
      LEFT JOIN "MS_ACADEMICO"."ACA_FAMILIAS" f 
        ON m."ALUMNO_ID" = f."ALUMNO_ID" 
        AND f."COLEGIO_ID" = m."COLEGIO_ID"
        AND f."ES_TITULAR_FINAN" = 'S'
        AND f."FECHA_BAJA" IS NULL
      WHERE m."CURSO_ID" = :cursoId 
        AND m."COLEGIO_ID" = :colegioId
        AND m."ESTADO" = 'REGULAR'
        AND m."FECHA_BAJA" IS NULL
    `;

    return sequelize.query(query, {
      replacements: { cursoId, colegioId },
      type: QueryTypes.SELECT,
    });
  },

  // ✅ NUEVO: Función para insertar muchas cuotas de golpe en la base de datos
  // ✅ NUEVO: Función para insertar muchas cuotas de golpe en la base de datos
  bulkCreate: async (cobros: any[]): Promise<void> => {
    await CuentaCobrar.bulkCreate(cobros as any); // <-- Agregamos el "as any" aquí adentro
  },
};
