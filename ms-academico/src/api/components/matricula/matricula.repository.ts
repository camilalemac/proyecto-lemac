import { QueryTypes, WhereOptions } from "sequelize";
import sequelize from "../../../config/database.config";
import Matricula, { EstadoPromocion, EstadoMatricula } from "../../../models/matricula.model";
import Curso from "../../../models/curso.model";
import Nivel from "../../../models/nivel.model";
import Periodo from "../../../models/periodo.model";

export const matriculaRepository = {
 findAllByCurso: async (cursoId: number, colegioId: number): Promise<any[]> => {
    const query = `
      SELECT 
        m.*,
        u."NOMBRES" AS "ALUMNO_NOMBRES",
        u."APELLIDOS" AS "ALUMNO_APELLIDOS",
        u."RUT_CUERPO" AS "ALUMNO_RUT",
        u."RUT_DV" AS "ALUMNO_RUT_DV",
        c."LETRA" AS "CURSO_LETRA",
        n."NOMBRE" AS "NIVEL_NOMBRE",
        p."ANIO" AS "PERIODO_ANIO",
        
        -- 👇 SUBCONSULTA 1: TRAE EL NOMBRE DEL APODERADO SIN DUPLICAR FILAS 👇
        (SELECT apo."NOMBRES" 
         FROM "MS_IDENTITY"."IDN_USUARIOS" apo 
         WHERE apo."GRUPO_ID" = u."GRUPO_ID" 
           AND apo."USER_ID" != u."USER_ID"
           -- 💡 Si en IDN_USUARIOS tienes un campo para diferenciar (Ej: "TIPO" o "ROL"), 
           -- puedes descomentar la línea de abajo para descartar hermanos:
           -- AND apo."TIPO_USUARIO" = 'APODERADO' 
           AND ROWNUM = 1) AS "APODERADO_NOMBRES",
           
        -- 👇 SUBCONSULTA 2: TRAE EL APELLIDO DEL APODERADO 👇
        (SELECT apo."APELLIDOS" 
         FROM "MS_IDENTITY"."IDN_USUARIOS" apo 
         WHERE apo."GRUPO_ID" = u."GRUPO_ID" 
           AND apo."USER_ID" != u."USER_ID"
           -- AND apo."TIPO_USUARIO" = 'APODERADO'
           AND ROWNUM = 1) AS "APODERADO_APELLIDOS"

      FROM "MS_ACADEMICO"."ACA_MATRICULAS" m
      JOIN "MS_IDENTITY"."IDN_USUARIOS" u ON m."ALUMNO_ID" = u."USER_ID"
      JOIN "MS_ACADEMICO"."ACA_CURSOS" c ON m."CURSO_ID" = c."CURSO_ID"
      JOIN "MS_ACADEMICO"."ACA_NIVELES" n ON c."NIVEL_ID" = n."NIVEL_ID"
      JOIN "MS_ACADEMICO"."ACA_PERIODOS" p ON c."PERIODO_ID" = p."PERIODO_ID"
      WHERE m."CURSO_ID" = :cursoId 
        AND m."COLEGIO_ID" = :colegioId
        AND m."FECHA_BAJA" IS NULL
      ORDER BY m."NUMERO_LISTA" ASC
    `;

    return sequelize.query(query, {
      replacements: { cursoId, colegioId },
      type: QueryTypes.SELECT,
    });
  },

  findAllByAlumno: async (alumnoId: number, colegioId: number): Promise<any[]> => {
    const query = `
      SELECT 
        m.*,
        u."NOMBRES" AS "ALUMNO_NOMBRES",
        u."APELLIDOS" AS "ALUMNO_APELLIDOS",
        u."RUT_CUERPO" AS "ALUMNO_RUT",
        u."RUT_DV" AS "ALUMNO_RUT_DV",
        c."LETRA" AS "CURSO_LETRA",
        n."NOMBRE" AS "NIVEL_NOMBRE",
        p."ANIO" AS "PERIODO_ANIO"
      FROM "MS_ACADEMICO"."ACA_MATRICULAS" m
      JOIN "MS_IDENTITY"."IDN_USUARIOS" u ON m."ALUMNO_ID" = u."USER_ID"
      JOIN "MS_ACADEMICO"."ACA_CURSOS" c ON m."CURSO_ID" = c."CURSO_ID"
      JOIN "MS_ACADEMICO"."ACA_NIVELES" n ON c."NIVEL_ID" = n."NIVEL_ID"
      JOIN "MS_ACADEMICO"."ACA_PERIODOS" p ON c."PERIODO_ID" = p."PERIODO_ID"
      WHERE m."ALUMNO_ID" = :alumnoId 
        AND m."COLEGIO_ID" = :colegioId
        AND m."FECHA_BAJA" IS NULL
      ORDER BY m."ANIO" DESC
    `;

    return sequelize.query(query, {
      replacements: { alumnoId, colegioId },
      type: QueryTypes.SELECT,
    });
  },

  findVigenteByAlumno: async (alumnoId: number, colegioId: number): Promise<Matricula | null> => {
    return Matricula.findOne({
      where: {
        ALUMNO_ID: alumnoId,
        COLEGIO_ID: colegioId,
        ESTADO: EstadoMatricula.REGULAR,
      } as WhereOptions,
      include: [
        {
          model: Curso,
          as: "curso",
          include: [
            { model: Nivel, as: "nivel" },
            { model: Periodo, as: "periodo" },
          ],
        },
      ],
      order: [["ANIO", "DESC"]],
    });
  },

  findById: async (matriculaId: number, colegioId: number): Promise<Matricula | null> => {
    return Matricula.findOne({
      where: { MATRICULA_ID: matriculaId, COLEGIO_ID: colegioId } as WhereOptions,
      include: [
        {
          model: Curso,
          as: "curso",
          include: [
            { model: Nivel, as: "nivel" },
            { model: Periodo, as: "periodo" },
          ],
        },
      ],
    });
  },

  findByAlumnoAnio: async (
    alumnoId: number,
    anio: number,
    colegioId: number,
  ): Promise<Matricula | null> => {
    return Matricula.findOne({
      where: { ALUMNO_ID: alumnoId, ANIO: anio, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },

  contarAlumnosPorCurso: async (cursoId: number, colegioId: number): Promise<number> => {
    return Matricula.count({
      where: {
        CURSO_ID: cursoId,
        COLEGIO_ID: colegioId,
        ESTADO: EstadoMatricula.REGULAR,
      } as WhereOptions,
    });
  },

  create: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number;
    ALUMNO_ID: number;
    ANIO: number;
    NUMERO_LISTA: number;
    FECHA_ALTA: Date;
    ESTADO: EstadoMatricula;
    ESTADO_PROMOCION: EstadoPromocion;
  }): Promise<Matricula> => {
    return Matricula.create(data);
  },

  updateEstadoPromocion: async (
    matriculaId: number,
    colegioId: number,
    estadoPromocion: EstadoPromocion,
  ): Promise<[number]> => {
    return Matricula.update(
      { ESTADO_PROMOCION: estadoPromocion },
      { where: { MATRICULA_ID: matriculaId, COLEGIO_ID: colegioId } as WhereOptions },
    );
  },

  updateEstado: async (
    matriculaId: number,
    colegioId: number,
    estado: EstadoMatricula,
  ): Promise<[number]> => {
    return Matricula.update(
      { ESTADO: estado },
      { where: { MATRICULA_ID: matriculaId, COLEGIO_ID: colegioId } as WhereOptions },
    );
  },

  softDelete: async (matriculaId: number, colegioId: number): Promise<number> => {
    return Matricula.destroy({
      where: { MATRICULA_ID: matriculaId, COLEGIO_ID: colegioId } as WhereOptions,
    });
  },
  findCursosByAlumnos: async (alumnoIds: number[]): Promise<any[]> => {
    if (!alumnoIds || alumnoIds.length === 0) return [];
    
    const query = `
      SELECT 
        m."ALUMNO_ID", 
        c."NIVEL_ID" -- O el campo que uses en ACA_CURSOS que represente el nombre completo si no tienes uno directo. 
                     -- Si tienes c."NOMBRE", usa c."NOMBRE" AS "CURSO_NOMBRE". 
                     -- Si construyes el nombre con Nivel + Letra, usa los joins necesarios como en tu método findAllByCurso.
      FROM "MS_ACADEMICO"."ACA_MATRICULAS" m
      JOIN "MS_ACADEMICO"."ACA_CURSOS" c ON m."CURSO_ID" = c."CURSO_ID"
      WHERE m."ALUMNO_ID" IN (:alumnoIds) 
        AND m."ESTADO" = 'REGULAR'
        AND m."FECHA_BAJA" IS NULL
    `;

    // NOTA: Ajusté la consulta basándome en tus otras consultas. Si necesitas unir ACA_NIVELES para armar el nombre (Ej: "1ro Básico A"), usa el JOIN respectivo. Te lo dejo adaptado para traer al menos el Curso ID y Letra si no hay un campo "NOMBRE" directo en ACA_CURSOS.
    const queryCompleta = `
      SELECT 
        m."ALUMNO_ID",
        n."NOMBRE" || ' ' || c."LETRA" AS "CURSO_NOMBRE"
      FROM "MS_ACADEMICO"."ACA_MATRICULAS" m
      JOIN "MS_ACADEMICO"."ACA_CURSOS" c ON m."CURSO_ID" = c."CURSO_ID"
      JOIN "MS_ACADEMICO"."ACA_NIVELES" n ON c."NIVEL_ID" = n."NIVEL_ID"
      WHERE m."ALUMNO_ID" IN (:alumnoIds)
        AND m."ESTADO" = 'REGULAR'
        AND m."FECHA_BAJA" IS NULL
    `;

    return sequelize.query(queryCompleta, {
      replacements: { alumnoIds },
      type: QueryTypes.SELECT,
    });
  },
};


