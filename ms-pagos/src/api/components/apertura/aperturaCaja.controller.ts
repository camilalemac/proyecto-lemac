import { Request, Response, NextFunction } from "express";
import { aperturaCajaService } from "./aperturaCaja.service";

export const obtenerAperturaCaja = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cursoId = Number(req.params.cursoId);
    const periodoAnio = Number(req.query.periodoAnio);

    const apertura = await aperturaCajaService.obtenerApertura(
      cursoId,
      periodoAnio,
      req.user!.colegioId,
    );

    res.status(200).json({ success: true, data: apertura });
  } catch (err) {
    next(err);
  }
};

export const registrarAperturaCaja = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { CURSO_ID, PERIODO_ANIO, MONTO_APERTURA } = req.body as any;

    const apertura = await aperturaCajaService.registrarApertura({
      COLEGIO_ID: req.user!.colegioId,
      CURSO_ID,
      PERIODO_ANIO,
      MONTO_APERTURA,
      CREADO_POR: req.user!.email, // Inyectamos de forma segura el email del payload JWT
    });

    res.status(201).json({ success: true, data: apertura });
  } catch (err) {
    next(err);
  }
};