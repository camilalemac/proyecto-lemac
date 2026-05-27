import { Response, NextFunction } from "express";
import { actaService, SolicitudActa } from "./acta.service";
import { RequestWithUser } from "../../middlewares/checkJwt.middleware";

export const generarActa = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const resultado = await actaService.generarActa({
      ...(req.body as SolicitudActa),
      colegioId: req.user!.colegioId,
      autorId: req.user!.userId,
    });
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

export const listarActas = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cursoId = req.query.cursoId ? Number(req.query.cursoId) : undefined;
    const actas = await actaService.listarActas(req.user!.colegioId, cursoId);
    res.status(200).json({ success: true, data: actas });
  } catch (err) {
    next(err);
  }
};
