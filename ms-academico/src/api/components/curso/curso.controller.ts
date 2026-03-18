import { Request, Response, NextFunction } from "express";
import { cursoService } from "./curso.service";

export const listarCursos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const periodoId = req.query.periodoId ? Number(req.query.periodoId) : undefined;
    const cursos = await cursoService.listarCursos(colegioId, periodoId);
    res.status(200).json({ success: true, data: cursos });
  } catch (err) {
    next(err);
  }
};

export const obtenerCurso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const cursoId = Number(req.params.cursoId);
    const curso = await cursoService.obtenerCurso(cursoId, colegioId);
    res.status(200).json({ success: true, data: curso });
  } catch (err) {
    next(err);
  }
};

export const obtenerMiCurso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const profesorJefeId = req.user!.userId;
    const curso = await cursoService.obtenerCursoDelProfesor(profesorJefeId, colegioId);
    res.status(200).json({ success: true, data: curso });
  } catch (err) {
    next(err);
  }
};

export const crearCurso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const { PERIODO_ID, NIVEL_ID, LETRA, PROFESOR_JEFE_ID } = req.body as {
      PERIODO_ID: number;
      NIVEL_ID: number;
      LETRA: string;
      PROFESOR_JEFE_ID: number | null;
    };

    const curso = await cursoService.crearCurso({
      COLEGIO_ID: colegioId,
      PERIODO_ID,
      NIVEL_ID,
      LETRA,
      PROFESOR_JEFE_ID: PROFESOR_JEFE_ID ?? null,
    });

    res.status(201).json({ success: true, data: curso });
  } catch (err) {
    next(err);
  }
};

export const asignarProfesorJefe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const cursoId = Number(req.params.cursoId);
    const { PROFESOR_JEFE_ID } = req.body as { PROFESOR_JEFE_ID: number };

    const curso = await cursoService.asignarProfesorJefe(cursoId, colegioId, PROFESOR_JEFE_ID);
    res.status(200).json({ success: true, data: curso });
  } catch (err) {
    next(err);
  }
};

export const actualizarCurso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const cursoId = Number(req.params.cursoId);
    const data = req.body as Partial<{
      NIVEL_ID: number;
      LETRA: string;
      PROFESOR_JEFE_ID: number | null;
    }>;

    const curso = await cursoService.actualizarCurso(cursoId, colegioId, data);
    res.status(200).json({ success: true, data: curso });
  } catch (err) {
    next(err);
  }
};

export const eliminarCurso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const cursoId = Number(req.params.cursoId);
    await cursoService.eliminarCurso(cursoId, colegioId);
    res.status(200).json({ success: true, message: "Curso eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
