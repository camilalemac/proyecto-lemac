import { WhereOptions } from "sequelize";
import Matricula, { EstadoPromocion, EstadoMatricula } from "../../../models/matricula.model";
import Curso from "../../../models/curso.model";
import Nivel from "../../../models/nivel.model";
import Periodo from "../../../models/periodo.model";

export const matriculaRepository = {
  findAllByCurso: async (cursoId: number, colegioId: number): Promise<Matricula[]> => {
    return Matricula.findAll({
      where: { CURSO_ID: cursoId, COLEGIO_ID: colegioId } as WhereOptions,
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
      order: [["NUMERO_LISTA", "ASC"]],
    });
  },

  findAllByAlumno: async (alumnoId: number, colegioId: number): Promise<Matricula[]> => {
    return Matricula.findAll({
      where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId } as WhereOptions,
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

  findVigenteByAlumno: async (alumnoId: number, colegioId: number): Promise<Matricula | null> => {
    return Matricula.findOne({
      where: {
        ALUMNO_ID: alumnoId,
        COLEGIO_ID: colegioId,
        ESTADO: EstadoMatricula.ACTIVA,
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
        ESTADO: EstadoMatricula.ACTIVA,
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
};
