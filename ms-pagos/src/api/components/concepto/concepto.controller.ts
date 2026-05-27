import { Request, Response, NextFunction } from "express";
import { conceptoService } from "./concepto.service";

export const listarConceptos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const conceptos = await conceptoService.listarConceptos(req.user!.colegioId);
    res.status(200).json({ success: true, data: conceptos });
  } catch (err) {
    next(err);
  }
};

export const listarConceptosActivos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const conceptos = await conceptoService.listarConceptosActivos(req.user!.colegioId);
    res.status(200).json({ success: true, data: conceptos });
  } catch (err) {
    next(err);
  }
};

export const obtenerConcepto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const concepto = await conceptoService.obtenerConcepto(
      Number(req.params.conceptoId),
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, data: concepto });
  } catch (err) {
    next(err);
  }
};

export const crearConcepto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { CATEGORIA_ID, CUENTA_DESTINO_ID, CODIGO, NOMBRE, MONTO_BASE, TIPO_COBRO } =
      req.body as {
        CATEGORIA_ID: number;
        CUENTA_DESTINO_ID: number;
        CODIGO: string;
        NOMBRE: string;
        MONTO_BASE: number;
        TIPO_COBRO: string;
      };
    const concepto = await conceptoService.crearConcepto({
      COLEGIO_ID: req.user!.colegioId,
      CATEGORIA_ID,
      CUENTA_DESTINO_ID,
      CODIGO,
      NOMBRE,
      MONTO_BASE,
      TIPO_COBRO,
    });
    res.status(201).json({ success: true, data: concepto });
  } catch (err) {
    next(err);
  }
};

export const actualizarConcepto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const concepto = await conceptoService.actualizarConcepto(
      Number(req.params.conceptoId),
      req.user!.colegioId,
      req.body as Partial<{
        NOMBRE: string;
        MONTO_BASE: number;
        TIPO_COBRO: string;
        ACTIVO: boolean;
        CATEGORIA_ID: number;
        CUENTA_DESTINO_ID: number;
      }>,
    );
    res.status(200).json({ success: true, data: concepto });
  } catch (err) {
    next(err);
  }
};

export const eliminarConcepto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await conceptoService.eliminarConcepto(Number(req.params.conceptoId), req.user!.colegioId);
    res.status(200).json({ success: true, message: "Concepto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
