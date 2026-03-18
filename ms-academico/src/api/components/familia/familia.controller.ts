import { Request, Response, NextFunction } from "express";
import { familiaService } from "./familia.service";

export const obtenerFamiliaDelAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const alumnoId = Number(req.params.alumnoId);
    const familia = await familiaService.obtenerFamiliaDelAlumno(alumnoId, colegioId);
    res.status(200).json({ success: true, data: familia });
  } catch (err) {
    next(err);
  }
};

export const obtenerMisFamiliares = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    // El apoderado consulta sus propios hijos vinculados
    const apoderadoId = req.user!.userId;
    const hijos = await familiaService.obtenerHijosDelApoderado(apoderadoId, colegioId);
    res.status(200).json({ success: true, data: hijos });
  } catch (err) {
    next(err);
  }
};

export const obtenerRelacion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const relacionId = Number(req.params.relacionId);
    const relacion = await familiaService.obtenerRelacion(relacionId, colegioId);
    res.status(200).json({ success: true, data: relacion });
  } catch (err) {
    next(err);
  }
};

export const vincularApoderadoAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const {
      ALUMNO_ID,
      APODERADO_ID,
      TIPO_RELACION,
      ES_APODERADO_ACAD,
      ES_TITULAR_FINAN,
      AUTORIZADO_RETIRO,
    } = req.body as {
      ALUMNO_ID: number;
      APODERADO_ID: number;
      TIPO_RELACION: string;
      ES_APODERADO_ACAD: boolean;
      ES_TITULAR_FINAN: boolean;
      AUTORIZADO_RETIRO: boolean;
    };

    const relacion = await familiaService.vincularApoderadoAlumno({
      COLEGIO_ID: colegioId,
      ALUMNO_ID,
      APODERADO_ID,
      TIPO_RELACION,
      ES_APODERADO_ACAD,
      ES_TITULAR_FINAN,
      AUTORIZADO_RETIRO,
    });

    res.status(201).json({ success: true, data: relacion });
  } catch (err) {
    next(err);
  }
};

export const actualizarRelacion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const relacionId = Number(req.params.relacionId);
    const data = req.body as Partial<{
      TIPO_RELACION: string;
      ES_APODERADO_ACAD: boolean;
      ES_TITULAR_FINAN: boolean;
      AUTORIZADO_RETIRO: boolean;
    }>;

    const relacion = await familiaService.actualizarRelacion(relacionId, colegioId, data);
    res.status(200).json({ success: true, data: relacion });
  } catch (err) {
    next(err);
  }
};

export const desvincularRelacion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const relacionId = Number(req.params.relacionId);
    await familiaService.desvincularRelacion(relacionId, colegioId);
    res.status(200).json({ success: true, message: "Relación familiar eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};
