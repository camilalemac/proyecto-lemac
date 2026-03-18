import { Request, Response, NextFunction } from "express";
import { cuentaCobrarService } from "./cuentaCobrar.service";

export const listarMisCobros = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cobros = await cuentaCobrarService.listarCobrosDelAlumno(
      req.user!.userId,
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, data: cobros });
  } catch (err) {
    next(err);
  }
};

export const listarCobrosPorAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cobros = await cuentaCobrarService.listarCobrosDelAlumno(
      Number(req.params.alumnoId),
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, data: cobros });
  } catch (err) {
    next(err);
  }
};

export const resumenMisCobros = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metodoId = req.query.metodoId ? Number(req.query.metodoId) : undefined;
    const resumen = await cuentaCobrarService.resumenCobros(
      req.user!.userId,
      req.user!.colegioId,
      metodoId,
    );
    res.status(200).json({ success: true, data: resumen });
  } catch (err) {
    next(err);
  }
};

export const resumenCobrosPorAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metodoId = req.query.metodoId ? Number(req.query.metodoId) : undefined;
    const resumen = await cuentaCobrarService.resumenCobros(
      Number(req.params.alumnoId),
      req.user!.colegioId,
      metodoId,
    );
    res.status(200).json({ success: true, data: resumen });
  } catch (err) {
    next(err);
  }
};

export const crearCobro = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      ALUMNO_ID,
      GRUPO_FAMILIAR_ID,
      APODERADO_ID,
      CONCEPTO_ID,
      DESCRIPCION,
      NUMERO_CUOTA,
      TOTAL_CUOTAS,
      MONTO_ORIGINAL,
      FECHA_VENCIMIENTO,
    } = req.body as {
      ALUMNO_ID: number;
      GRUPO_FAMILIAR_ID: number | null;
      APODERADO_ID: number | null;
      CONCEPTO_ID: number;
      DESCRIPCION: string | null;
      NUMERO_CUOTA: number;
      TOTAL_CUOTAS: number;
      MONTO_ORIGINAL: number;
      FECHA_VENCIMIENTO: Date;
    };
    const cobro = await cuentaCobrarService.crearCobro({
      COLEGIO_ID: req.user!.colegioId,
      ALUMNO_ID,
      GRUPO_FAMILIAR_ID: GRUPO_FAMILIAR_ID ?? null,
      APODERADO_ID: APODERADO_ID ?? null,
      CONCEPTO_ID,
      DESCRIPCION: DESCRIPCION ?? null,
      NUMERO_CUOTA,
      TOTAL_CUOTAS,
      MONTO_ORIGINAL,
      FECHA_VENCIMIENTO,
    });
    res.status(201).json({ success: true, data: cobro });
  } catch (err) {
    next(err);
  }
};

export const eliminarCobro = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await cuentaCobrarService.eliminarCobro(Number(req.params.cobroId), req.user!.colegioId);
    res.status(200).json({ success: true, message: "Cobro eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
