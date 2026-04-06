import { Request, Response, NextFunction } from "express";
import { matriculaService } from "./matricula.service";

export const listarAlumnosPorCurso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const cursoId = Number(req.params.cursoId);
    const matriculas = await matriculaService.listarAlumnosPorCurso(cursoId, colegioId);
    res.status(200).json({ success: true, data: matriculas });
  } catch (err) {
    next(err);
  }
};

export const listarMatriculasPorAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const alumnoId = Number(req.params.alumnoId);
    const matriculas = await matriculaService.listarMatriculasPorAlumno(alumnoId, colegioId);
    res.status(200).json({ success: true, data: matriculas });
  } catch (err) {
    next(err);
  }
};

export const obtenerMatriculaVigente = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    // El alumno consulta su propia matrícula vigente
    const alumnoId = req.user!.userId;
    const matricula = await matriculaService.obtenerMatriculaVigente(alumnoId, colegioId);
    res.status(200).json({ success: true, data: matricula });
  } catch (err) {
    next(err);
  }
};

export const obtenerMatricula = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const matriculaId = Number(req.params.matriculaId);
    const matricula = await matriculaService.obtenerMatricula(matriculaId, colegioId);
    res.status(200).json({ success: true, data: matricula });
  } catch (err) {
    next(err);
  }
};

export const crearMatricula = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const { CURSO_ID, ALUMNO_ID, ANIO, FECHA_ALTA } = req.body as {
      CURSO_ID: number;
      ALUMNO_ID: number;
      ANIO: number;
      FECHA_ALTA: Date;
    };

    const matricula = await matriculaService.crearMatricula({
      COLEGIO_ID: colegioId,
      CURSO_ID,
      ALUMNO_ID,
      ANIO,
      FECHA_ALTA,
    });

    res.status(201).json({ success: true, data: matricula });
  } catch (err) {
    next(err);
  }
};

export const promoverAlumnos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const cursoId = Number(req.params.cursoId);
    const { alumnosPromovidosIds } = req.body as { alumnosPromovidosIds: number[] };

    const resultado = await matriculaService.promoverAlumnos(
      cursoId,
      colegioId,
      alumnosPromovidosIds,
    );

    res.status(200).json({
      success: true,
      message: "Proceso de promoción completado exitosamente",
      data: resultado,
    });
  } catch (err) {
    next(err);
  }
};

export const retirarAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const matriculaId = Number(req.params.matriculaId);
    await matriculaService.retirarAlumno(matriculaId, colegioId);
    res.status(200).json({ success: true, message: "Alumno retirado correctamente" });
  } catch (err) {
    next(err);
  }
};
