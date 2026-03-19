import { Response, NextFunction } from "express";
import { reporteService, SolicitudReporte } from "./reporte.service";
import { RequestWithUser } from "../../middlewares/checkJwt.middleware";

export const generarReporte = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const resultado = await reporteService.generarReporte({
      ...(req.body as SolicitudReporte),
      colegioId: req.user!.colegioId,
      autorId: req.user!.userId,
    });
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

export const listarReportes = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cursoId = req.query.cursoId ? Number(req.query.cursoId) : undefined;
    const reportes = await reporteService.listarReportes(req.user!.colegioId, cursoId);
    res.status(200).json({ success: true, data: reportes });
  } catch (err) {
    next(err);
  }
};
