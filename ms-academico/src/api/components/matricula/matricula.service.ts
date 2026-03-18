import sequelize from "../../../config/database.config";
import { matriculaRepository } from "./matricula.repository";
import { cursoRepository } from "../curso/curso.repository";
import { periodoRepository } from "../periodo/periodo.repository";
import { nivelRepository } from "../nivel/nivel.repository";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";
import Matricula, { EstadoPromocion, EstadoMatricula } from "../../../models/matricula.model";

export interface ResultadoPromocion {
  promovidos: number[];
  reprobados: number[];
  matriculasCreadas: number;
}

export const matriculaService = {
  listarAlumnosPorCurso: async (cursoId: number, colegioId: number): Promise<Matricula[]> => {
    const curso = await cursoRepository.findById(cursoId, colegioId);
    if (!curso) {
      throw ApiError.notFound(`Curso con ID ${cursoId} no encontrado`);
    }
    return matriculaRepository.findAllByCurso(cursoId, colegioId);
  },

  listarMatriculasPorAlumno: async (alumnoId: number, colegioId: number): Promise<Matricula[]> => {
    return matriculaRepository.findAllByAlumno(alumnoId, colegioId);
  },

  obtenerMatriculaVigente: async (alumnoId: number, colegioId: number): Promise<Matricula> => {
    const matricula = await matriculaRepository.findVigenteByAlumno(alumnoId, colegioId);
    if (!matricula) {
      throw ApiError.notFound("El alumno no tiene una matrícula activa");
    }
    return matricula;
  },

  obtenerMatricula: async (matriculaId: number, colegioId: number): Promise<Matricula> => {
    const matricula = await matriculaRepository.findById(matriculaId, colegioId);
    if (!matricula) {
      throw ApiError.notFound(`Matrícula con ID ${matriculaId} no encontrada`);
    }
    return matricula;
  },

  crearMatricula: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number;
    ALUMNO_ID: number;
    ANIO: number;
    FECHA_ALTA: Date;
  }): Promise<Matricula> => {
    // Validar que el curso exista
    const curso = await cursoRepository.findById(data.CURSO_ID, data.COLEGIO_ID);
    if (!curso) {
      throw ApiError.badRequest(`El curso con ID ${data.CURSO_ID} no existe en este colegio`);
    }

    // Validar que el alumno no tenga ya una matrícula para ese año
    const matriculaExistente = await matriculaRepository.findByAlumnoAnio(
      data.ALUMNO_ID,
      data.ANIO,
      data.COLEGIO_ID,
    );
    if (matriculaExistente) {
      throw ApiError.conflict(
        `El alumno ya tiene una matrícula registrada para el año ${data.ANIO}`,
      );
    }

    // Asignar número de lista correlativo
    const totalActuales = await matriculaRepository.contarAlumnosPorCurso(
      data.CURSO_ID,
      data.COLEGIO_ID,
    );

    return matriculaRepository.create({
      ...data,
      NUMERO_LISTA: totalActuales + 1,
      ESTADO: EstadoMatricula.ACTIVA,
      ESTADO_PROMOCION: EstadoPromocion.PENDIENTE,
    });
  },

  /**
   * Proceso de promoción de fin de año.
   * El profesor jefe entrega la lista de IDs de alumnos promovidos.
   * Todos los que no estén en esa lista se marcan como reprobados.
   * Para los promovidos se crea una nueva matrícula en el curso del siguiente nivel para el año siguiente.
   *
   * @param cursoId - Curso actual del que se realiza la promoción
   * @param colegioId - Colegio del profesor autenticado
   * @param alumnosPromovidosIds - Lista de ALUMNO_IDs que aprobaron el año
   */
  promoverAlumnos: async (
    cursoId: number,
    colegioId: number,
    alumnosPromovidosIds: number[],
  ): Promise<ResultadoPromocion> => {
    const curso = await cursoRepository.findById(cursoId, colegioId);
    if (!curso) {
      throw ApiError.notFound(`Curso con ID ${cursoId} no encontrado`);
    }

    // Obtener todas las matrículas activas del curso
    const matriculas = await matriculaRepository.findAllByCurso(cursoId, colegioId);
    const matriculasActivas = matriculas.filter((m) => m.ESTADO === EstadoMatricula.ACTIVA);

    if (matriculasActivas.length === 0) {
      throw ApiError.badRequest("El curso no tiene alumnos matriculados activos");
    }

    // Validar que todos los IDs entregados pertenezcan al curso
    const alumnosDelCurso = new Set(matriculasActivas.map((m) => m.ALUMNO_ID));
    const idsInvalidos = alumnosPromovidosIds.filter((id) => !alumnosDelCurso.has(id));
    if (idsInvalidos.length > 0) {
      throw ApiError.badRequest(
        `Los siguientes alumnos no pertenecen al curso: ${idsInvalidos.join(", ")}`,
      );
    }

    // Buscar el nivel siguiente para los promovidos
    const nivelActual = await nivelRepository.findById(curso.NIVEL_ID, colegioId);
    if (!nivelActual) {
      throw ApiError.internal("No se pudo obtener el nivel actual del curso");
    }

    // El año se obtiene desde las matrículas activas del curso, no del curso mismo
    const anioActual = matriculasActivas[0]?.ANIO ?? new Date().getFullYear();
    const siguienteAnio = anioActual + 1;

    // Obtener o validar que exista el período del año siguiente
    const periodoSiguiente = await periodoRepository.findByAnio(siguienteAnio, colegioId);
    if (!periodoSiguiente) {
      throw ApiError.badRequest(
        `No existe un período académico registrado para el año ${siguienteAnio}. Créelo antes de realizar la promoción.`,
      );
    }

    // Buscar todos los niveles del colegio para encontrar el siguiente grado
    const nivelesDelColegio = await nivelRepository.findAllByColegio(colegioId);
    const nivelSiguiente = nivelesDelColegio.find(
      (n) => n.GRADO_MINEDUC === nivelActual.GRADO_MINEDUC + 1,
    );

    const promovidos: number[] = [];
    const reprobados: number[] = [];
    let matriculasCreadas = 0;

    // Ejecutar en transacción para garantizar consistencia
    await sequelize.transaction(async (t) => {
      for (const matricula of matriculasActivas) {
        const esPromovido = alumnosPromovidosIds.includes(matricula.ALUMNO_ID);

        // Marcar estado de promoción en la matrícula actual
        await Matricula.update(
          {
            ESTADO_PROMOCION: esPromovido ? EstadoPromocion.PROMOVIDO : EstadoPromocion.REPROBADO,
          },
          { where: { MATRICULA_ID: matricula.MATRICULA_ID }, transaction: t },
        );

        if (esPromovido) {
          promovidos.push(matricula.ALUMNO_ID);

          // Crear nueva matrícula solo si hay nivel siguiente
          if (nivelSiguiente) {
            // Buscar si ya existe un curso del mismo nivel y letra en el período siguiente
            const cursoSiguiente = await cursoRepository.findByNivelLetraPeriodo(
              nivelSiguiente.NIVEL_ID,
              curso.LETRA,
              periodoSiguiente.PERIODO_ID,
              colegioId,
            );

            if (cursoSiguiente) {
              const totalEnCursoSiguiente = await matriculaRepository.contarAlumnosPorCurso(
                cursoSiguiente.CURSO_ID,
                colegioId,
              );

              await Matricula.create(
                {
                  COLEGIO_ID: colegioId,
                  CURSO_ID: cursoSiguiente.CURSO_ID,
                  ALUMNO_ID: matricula.ALUMNO_ID,
                  ANIO: siguienteAnio,
                  NUMERO_LISTA: totalEnCursoSiguiente + 1,
                  FECHA_ALTA: new Date(),
                  ESTADO: EstadoMatricula.ACTIVA,
                  ESTADO_PROMOCION: EstadoPromocion.PENDIENTE,
                },
                { transaction: t },
              );

              matriculasCreadas++;
            } else {
              logger.warn(
                `[ms-academico] No se encontró curso ${nivelSiguiente.NOMBRE_CORTO}${curso.LETRA} para el período ${siguienteAnio}. Alumno ID ${matricula.ALUMNO_ID} promovido sin matrícula nueva.`,
              );
            }
          }
        } else {
          reprobados.push(matricula.ALUMNO_ID);
        }
      }
    });

    logger.info("[ms-academico] Proceso de promoción completado", {
      cursoId,
      colegioId,
      totalAlumnos: matriculasActivas.length,
      promovidos: promovidos.length,
      reprobados: reprobados.length,
      matriculasCreadas,
    });

    return { promovidos, reprobados, matriculasCreadas };
  },

  retirarAlumno: async (matriculaId: number, colegioId: number): Promise<void> => {
    const matricula = await matriculaRepository.findById(matriculaId, colegioId);
    if (!matricula) {
      throw ApiError.notFound(`Matrícula con ID ${matriculaId} no encontrada`);
    }
    if (matricula.ESTADO !== EstadoMatricula.ACTIVA) {
      throw ApiError.conflict("La matrícula no está activa");
    }
    await matriculaRepository.updateEstado(matriculaId, colegioId, EstadoMatricula.RETIRADA);
  },
};
