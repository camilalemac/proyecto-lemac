import { cursoRepository } from "./curso.repository";
import { periodoRepository } from "../periodo/periodo.repository";
import { nivelRepository } from "../nivel/nivel.repository";
import { ApiError } from "../../../utils/ApiError";
import Curso from "../../../models/curso.model";

export const cursoService = {
  listarCursos: async (colegioId: number, periodoId?: number): Promise<Curso[]> => {
    return cursoRepository.findAllByColegio(colegioId, periodoId);
  },

  obtenerCurso: async (cursoId: number, colegioId: number): Promise<Curso> => {
    const curso = await cursoRepository.findById(cursoId, colegioId);
    if (!curso) {
      throw ApiError.notFound(`Curso con ID ${cursoId} no encontrado`);
    }
    return curso;
  },

  obtenerCursoDelProfesor: async (profesorJefeId: number, colegioId: number): Promise<Curso> => {
    const curso = await cursoRepository.findByProfesorJefe(profesorJefeId, colegioId);
    if (!curso) {
      throw ApiError.notFound("El profesor no tiene un curso asignado como profesor jefe");
    }
    return curso;
  },

  crearCurso: async (data: {
    COLEGIO_ID: number;
    PERIODO_ID: number;
    NIVEL_ID: number;
    LETRA: string;
    PROFESOR_JEFE_ID: number | null;
  }): Promise<Curso> => {
    // Validar que el período exista y pertenezca al colegio
    const periodo = await periodoRepository.findById(data.PERIODO_ID, data.COLEGIO_ID);
    if (!periodo) {
      throw ApiError.badRequest(`El período con ID ${data.PERIODO_ID} no existe en este colegio`);
    }

    // Validar que el nivel exista y pertenezca al colegio
    const nivel = await nivelRepository.findById(data.NIVEL_ID, data.COLEGIO_ID);
    if (!nivel) {
      throw ApiError.badRequest(`El nivel con ID ${data.NIVEL_ID} no existe en este colegio`);
    }

    // Validar que no exista ya un curso con el mismo nivel, letra y período
    const cursoExistente = await cursoRepository.findByNivelLetraPeriodo(
      data.NIVEL_ID,
      data.LETRA,
      data.PERIODO_ID,
      data.COLEGIO_ID,
    );
    if (cursoExistente) {
      throw ApiError.conflict(
        `Ya existe el curso ${nivel.NOMBRE_CORTO}${data.LETRA} para el período seleccionado`,
      );
    }

    return cursoRepository.create(data);
  },

  asignarProfesorJefe: async (
    cursoId: number,
    colegioId: number,
    profesorJefeId: number,
  ): Promise<Curso> => {
    // Validar que el profesor no sea ya jefe de otro curso activo
    const cursoActual = await cursoRepository.findByProfesorJefe(profesorJefeId, colegioId);
    if (cursoActual && cursoActual.CURSO_ID !== cursoId) {
      throw ApiError.conflict(
        `El profesor ya está asignado como jefe del curso ID ${cursoActual.CURSO_ID}`,
      );
    }

    const [filasAfectadas] = await cursoRepository.update(cursoId, colegioId, {
      PROFESOR_JEFE_ID: profesorJefeId,
    });
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Curso con ID ${cursoId} no encontrado`);
    }

    return cursoService.obtenerCurso(cursoId, colegioId);
  },

  actualizarCurso: async (
    cursoId: number,
    colegioId: number,
    data: Partial<{ NIVEL_ID: number; LETRA: string; PROFESOR_JEFE_ID: number | null }>,
  ): Promise<Curso> => {
    const [filasAfectadas] = await cursoRepository.update(cursoId, colegioId, data);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Curso con ID ${cursoId} no encontrado`);
    }
    return cursoService.obtenerCurso(cursoId, colegioId);
  },

  eliminarCurso: async (cursoId: number, colegioId: number): Promise<void> => {
    const filasAfectadas = await cursoRepository.softDelete(cursoId, colegioId);
    if (filasAfectadas === 0) {
      throw ApiError.notFound(`Curso con ID ${cursoId} no encontrado`);
    }
  },
};
