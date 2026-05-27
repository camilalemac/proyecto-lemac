import { Request, Response, NextFunction } from "express";
import { metodoPagoService } from "./metodoPago.service";

export const listarMetodos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metodos = await metodoPagoService.listarMetodos(req.user!.colegioId);
    res.status(200).json({ success: true, data: metodos });
  } catch (err) {
    next(err);
  }
};

export const listarMetodosActivos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metodos = await metodoPagoService.listarMetodosActivos(req.user!.colegioId);
    res.status(200).json({ success: true, data: metodos });
  } catch (err) {
    next(err);
  }
};

export const cotizarPago = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const monto = Number(req.query.monto);
    const metodoId = Number(req.query.metodoId);
    const cotizacion = await metodoPagoService.cotizarPago(monto, metodoId, req.user!.colegioId);
    res.status(200).json({ success: true, data: cotizacion });
  } catch (err) {
    next(err);
  }
};

export const crearMetodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { NOMBRE_METODO, COMISION_PORCENTAJE, COMISION_FIJA, IMPUESTO_PORCENTAJE } = req.body as {
      NOMBRE_METODO: string;
      COMISION_PORCENTAJE: number;
      COMISION_FIJA: number;
      IMPUESTO_PORCENTAJE: number;
    };
    const metodo = await metodoPagoService.crearMetodo({
      COLEGIO_ID: req.user!.colegioId,
      NOMBRE_METODO,
      COMISION_PORCENTAJE,
      COMISION_FIJA,
      IMPUESTO_PORCENTAJE,
    });
    res.status(201).json({ success: true, data: metodo });
  } catch (err) {
    next(err);
  }
};

export const actualizarMetodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metodo = await metodoPagoService.actualizarMetodo(
      Number(req.params.metodoId),
      req.user!.colegioId,
      req.body as Partial<{
        NOMBRE_METODO: string;
        COMISION_PORCENTAJE: number;
        COMISION_FIJA: number;
        IMPUESTO_PORCENTAJE: number;
        ESTADO: string;
      }>,
    );
    res.status(200).json({ success: true, data: metodo });
  } catch (err) {
    next(err);
  }
};

export const eliminarMetodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await metodoPagoService.eliminarMetodo(Number(req.params.metodoId), req.user!.colegioId);
    res.status(200).json({ success: true, message: "Método de pago eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
