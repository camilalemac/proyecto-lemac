import { QueryTypes, WhereOptions } from "sequelize"; // <-- Agregamos QueryTypes
import Familia from "../../../models/familia.model";
import sequelize from "../../../config/database.config"; // <-- Importamos tu conexión a la DB

export const familiaRepository = {
  findAllByAlumno: async (alumnoId: number, colegioId: number): Promise<Familia[]> => {
    return Familia.findAll({
      where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  // ✅ MODIFICADO: Consulta SQL directa para hacer JOIN entre esquemas
  findAllByApoderado: async (apoderadoId: number, colegioId: number): Promise<any[]> => {
    const query = `
      SELECT 
        f."RELACION_ID", 
        f."COLEGIO_ID", 
        f."ALUMNO_ID", 
        f."APODERADO_ID", 
        f."TIPO_RELACION", 
        f."ES_APODERADO_ACAD", 
        f."ES_TITULAR_FINAN", 
        f."AUTORIZADO_RETIRO", 
        f."FECHA_CREACION", 
        f."FECHA_ACTUALIZACION", 
        f."FECHA_BAJA",
        u."NOMBRES" AS "ALUMNO_NOMBRES",
        u."APELLIDOS" AS "ALUMNO_APELLIDOS",
        u."RUT_CUERPO" AS "ALUMNO_RUT",
        u."RUT_DV" AS "ALUMNO_RUT_DV"
      FROM "MS_ACADEMICO"."ACA_FAMILIAS" f
      JOIN "MS_IDENTITY"."IDN_USUARIOS" u 
        ON f."ALUMNO_ID" = u."USER_ID"
      WHERE f."APODERADO_ID" = :apoderadoId 
        AND f."COLEGIO_ID" = :colegioId
        AND f."FECHA_BAJA" IS NULL
    `;

    return sequelize.query(query, {
      replacements: { apoderadoId, colegioId },
      type: QueryTypes.SELECT,
    });
  },

  findById: async (relacionId: number, colegioId: number): Promise<Familia | null> => {
    return Familia.findOne({
      where: { RELACION_ID: relacionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  findByAlumnoApoderado: async (
    alumnoId: number,
    apoderadoId: number,
    colegioId: number,
  ): Promise<Familia | null> => {
    return Familia.findOne({
      where: {
        ALUMNO_ID: alumnoId,
        APODERADO_ID: apoderadoId,
        COLEGIO_ID: colegioId,
      } as WhereOptions,
    });
  },

  findTitularFinanciero: async (alumnoId: number, colegioId: number): Promise<Familia | null> => {
    return Familia.findOne({
      where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId, ES_TITULAR_FINAN: "S" } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    ALUMNO_ID: number;
    APODERADO_ID: number;
    TIPO_RELACION: string;
    ES_APODERADO_ACAD: string;
    ES_TITULAR_FINAN: string;
    AUTORIZADO_RETIRO: string;
  }): Promise<Familia> => {
    return Familia.create(data);
  },

  update: async (
    relacionId: number,
    colegioId: number,
    data: Partial<{
      TIPO_RELACION: string;
      ES_APODERADO_ACAD: string;
      ES_TITULAR_FINAN: string;
      AUTORIZADO_RETIRO: string;
    }>,
  ): Promise<[number]> => {
    return Familia.update(data, {
      where: { RELACION_ID: relacionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (relacionId: number, colegioId: number): Promise<number> => {
    return Familia.destroy({
      where: { RELACION_ID: relacionId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
