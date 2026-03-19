import { QueryTypes, WhereOptions } from "sequelize";
import sequelize from "../../../config/database.config";
import Curso from "../../../models/curso.model";

export const cursoRepository = {
  findAllByColegio: async (colegioId: number, periodoId?: number): Promise<any[]> => {
    let query = `
      SELECT 
        c.*,
        n."NOMBRE_LARGO" AS "NIVEL_NOMBRE_LARGO",
        n."NOMBRE_CORTO" AS "NIVEL_NOMBRE_CORTO",
        n."GRADO_MINEDUC" AS "NIVEL_GRADO_MINEDUC",
        p."ANIO" AS "PERIODO_ANIO",
        u."NOMBRES" AS "PROFESOR_NOMBRES",
        u."APELLIDOS" AS "PROFESOR_APELLIDOS",
        u."RUT_CUERPO" AS "PROFESOR_RUT",
        u."RUT_DV" AS "PROFESOR_RUT_DV"
      FROM "MS_ACADEMICO"."ACA_CURSOS" c
      JOIN "MS_ACADEMICO"."ACA_NIVELES" n ON c."NIVEL_ID" = n."NIVEL_ID"
      JOIN "MS_ACADEMICO"."ACA_PERIODOS" p ON c."PERIODO_ID" = p."PERIODO_ID"
      LEFT JOIN "MS_IDENTITY"."IDN_USUARIOS" u ON c."PROFESOR_JEFE_ID" = u."USER_ID"
      WHERE c."COLEGIO_ID" = :colegioId
        AND c."FECHA_BAJA" IS NULL
    `;

    const replacements: Record<string, any> = { colegioId };

    if (periodoId) {
      query += ` AND c."PERIODO_ID" = :periodoId`;
      replacements.periodoId = periodoId;
    }

    query += ` ORDER BY n."GRADO_MINEDUC" ASC, c."LETRA" ASC`;

    return sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  },

  findById: async (cursoId: number, colegioId: number): Promise<any | null> => {
    const query = `
      SELECT 
        c.*,
        n."NOMBRE" AS "NIVEL_NOMBRE_LARGO",
        n."NOMBRE_CORTO" AS "NIVEL_NOMBRE_CORTO",
        n."GRADO_MINEDUC" AS "NIVEL_GRADO_MINEDUC",
        p."ANIO" AS "PERIODO_ANIO",
        u."NOMBRES" AS "PROFESOR_NOMBRES",
        u."APELLIDOS" AS "PROFESOR_APELLIDOS",
        u."RUT_CUERPO" AS "PROFESOR_RUT",
        u."RUT_DV" AS "PROFESOR_RUT_DV"
      FROM "MS_ACADEMICO"."ACA_CURSOS" c
      JOIN "MS_ACADEMICO"."ACA_NIVELES" n ON c."NIVEL_ID" = n."NIVEL_ID"
      JOIN "MS_ACADEMICO"."ACA_PERIODOS" p ON c."PERIODO_ID" = p."PERIODO_ID"
      LEFT JOIN "MS_IDENTITY"."IDN_USUARIOS" u ON c."PROFESOR_JEFE_ID" = u."USER_ID"
      WHERE c."CURSO_ID" = :cursoId 
        AND c."COLEGIO_ID" = :colegioId
        AND c."FECHA_BAJA" IS NULL
    `;

    const cursos = await sequelize.query(query, {
      replacements: { cursoId, colegioId },
      type: QueryTypes.SELECT,
    });

    return cursos.length > 0 ? cursos[0] : null;
  },

  findByProfesorJefe: async (profesorJefeId: number, colegioId: number): Promise<any | null> => {
    const query = `
      SELECT 
        c.*,
        n."NOMBRE_LARGO" AS "NIVEL_NOMBRE_LARGO",
        n."NOMBRE_CORTO" AS "NIVEL_NOMBRE_CORTO",
        n."GRADO_MINEDUC" AS "NIVEL_GRADO_MINEDUC",
        p."ANIO" AS "PERIODO_ANIO",
        u."NOMBRES" AS "PROFESOR_NOMBRES",
        u."APELLIDOS" AS "PROFESOR_APELLIDOS"
      FROM "MS_ACADEMICO"."ACA_CURSOS" c
      JOIN "MS_ACADEMICO"."ACA_NIVELES" n ON c."NIVEL_ID" = n."NIVEL_ID"
      JOIN "MS_ACADEMICO"."ACA_PERIODOS" p ON c."PERIODO_ID" = p."PERIODO_ID"
      JOIN "MS_IDENTITY"."IDN_USUARIOS" u ON c."PROFESOR_JEFE_ID" = u."USER_ID"
      WHERE c."PROFESOR_JEFE_ID" = :profesorJefeId 
        AND c."COLEGIO_ID" = :colegioId
        AND c."FECHA_BAJA" IS NULL
    `;

    const cursos = await sequelize.query(query, {
      replacements: { profesorJefeId, colegioId },
      type: QueryTypes.SELECT,
    });

    return cursos.length > 0 ? cursos[0] : null;
  },

  findByNivelLetraPeriodo: async (
    nivelId: number,
    letra: string,
    periodoId: number,
    colegioId: number,
  ): Promise<Curso | null> => {
    return Curso.findOne({
      where: {
        NIVEL_ID: nivelId,
        LETRA: letra,
        PERIODO_ID: periodoId,
        COLEGIO_ID: colegioId,
      } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    PERIODO_ID: number;
    NIVEL_ID: number;
    LETRA: string;
    PROFESOR_JEFE_ID: number | null;
  }): Promise<Curso> => {
    return Curso.create(data);
  },

  update: async (
    cursoId: number,
    colegioId: number,
    data: Partial<{
      NIVEL_ID: number;
      LETRA: string;
      PROFESOR_JEFE_ID: number | null;
    }>,
  ): Promise<[number]> => {
    return Curso.update(data, {
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  softDelete: async (cursoId: number, colegioId: number): Promise<number> => {
    return Curso.destroy({
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
};
