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
      ES_APODERADO_ACAD: ES_APODERADO_ACAD ? "S" : "N",
      ES_TITULAR_FINAN: ES_TITULAR_FINAN ? "S" : "N",
      AUTORIZADO_RETIRO: AUTORIZADO_RETIRO ? "S" : "N",
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

    const dataMapeada = {
      TIPO_RELACION: data.TIPO_RELACION,
      ES_APODERADO_ACAD:
        data.ES_APODERADO_ACAD !== undefined ? (data.ES_APODERADO_ACAD ? "S" : "N") : undefined,
      ES_TITULAR_FINAN:
        data.ES_TITULAR_FINAN !== undefined ? (data.ES_TITULAR_FINAN ? "S" : "N") : undefined,
      AUTORIZADO_RETIRO:
        data.AUTORIZADO_RETIRO !== undefined ? (data.AUTORIZADO_RETIRO ? "S" : "N") : undefined,
    };

    const relacion = await familiaService.actualizarRelacion(relacionId, colegioId, dataMapeada);
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
