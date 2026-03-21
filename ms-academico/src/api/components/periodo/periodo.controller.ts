import { Request, Response, NextFunction } from "express";
import { periodoService } from "./periodo.service";

export const listarPeriodos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const periodos = await periodoService.listarPeriodos(colegioId);
    res.status(200).json({ success: true, data: periodos });
  } catch (err) {
    next(err);
  }
};

export const obtenerPeriodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const periodoId = Number(req.params.periodoId);
    const periodo = await periodoService.obtenerPeriodo(periodoId, colegioId);
    res.status(200).json({ success: true, data: periodo });
  } catch (err) {
    next(err);
  }
};

export const obtenerPeriodoVigente = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const periodo = await periodoService.obtenerPeriodoVigente(colegioId);
    res.status(200).json({ success: true, data: periodo });
  } catch (err) {
    next(err);
  }
};

export const crearPeriodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const { ANIO, NOMBRE, FECHA_INICIO, FECHA_FIN } = req.body as {
      ANIO: number;
      NOMBRE: string;
      FECHA_INICIO: Date;
      FECHA_FIN: Date;
    };

    const periodo = await periodoService.crearPeriodo({
      COLEGIO_ID: colegioId,
      ANIO,
      NOMBRE,
      FECHA_INICIO,
      FECHA_FIN,
    });

    res.status(201).json({ success: true, data: periodo });
  } catch (err) {
    next(err);
  }
};

export const actualizarPeriodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const periodoId = Number(req.params.periodoId);
    const data = req.body as Partial<{
      NOMBRE: string;
      FECHA_INICIO: Date;
      FECHA_FIN: Date;
      ESTADO: string;
    }>;

    const periodo = await periodoService.actualizarPeriodo(periodoId, colegioId, data);
    res.status(200).json({ success: true, data: periodo });
  } catch (err) {
    next(err);
  }
};

export const eliminarPeriodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const periodoId = Number(req.params.periodoId);
    await periodoService.eliminarPeriodo(periodoId, colegioId);
    res.status(200).json({ success: true, message: "Período eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
