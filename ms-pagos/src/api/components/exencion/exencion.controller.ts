import { Request, Response, NextFunction } from "express";
import { exencionService } from "./exencion.service";

export const listarExenciones = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exenciones = await exencionService.listarExenciones(req.user!.colegioId);
    res.status(200).json({ success: true, data: exenciones });
  } catch (err) {
    next(err);
  }
};

export const listarPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exenciones = await exencionService.listarPendientes(req.user!.colegioId);
    res.status(200).json({ success: true, data: exenciones });
  } catch (err) {
    next(err);
  }
};

export const solicitarExencion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { COBRO_ID, MOTIVO } = req.body as { COBRO_ID: number; MOTIVO: string };
    const exencion = await exencionService.solicitarExencion({
      COLEGIO_ID: req.user!.colegioId,
      COBRO_ID,
      MOTIVO,
    });
    res.status(201).json({ success: true, data: exencion });
  } catch (err) {
    next(err);
  }
};

export const revisarComoProfesor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { aprobado } = req.body as { aprobado: boolean };
    const exencion = await exencionService.revisarComoProfesor(
      Number(req.params.exencionId),
      req.user!.colegioId,
      aprobado,
      req.user!.userId,
    );
    res.status(200).json({ success: true, data: exencion });
  } catch (err) {
    next(err);
  }
};

export const revisarComoTesorero = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { aprobado, observacion } = req.body as { aprobado: boolean; observacion: string | null };
    const exencion = await exencionService.revisarComoTesorero(
      Number(req.params.exencionId),
      req.user!.colegioId,
      aprobado,
      req.user!.userId,
      observacion ?? null,
    );
    res.status(200).json({ success: true, data: exencion });
  } catch (err) {
    next(err);
  }
};
