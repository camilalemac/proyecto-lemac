import { Request, Response, NextFunction } from "express";
import { transaccionService } from "./transaccion.service";
import { logger } from "../../../utils/logger";

export const iniciarPago = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { cobrosIds, metodoId, metodoPagoNombre } = req.body as {
      cobrosIds: number[];
      metodoId: number;
      metodoPagoNombre: string;
    };
    const resultado = await transaccionService.iniciarPago({
      colegioId: req.user!.colegioId,
      cobrosIds,
      metodoId,
      metodoPagoNombre,
    });
    res.status(201).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

export const retornoWebpay = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = (req.query.token_ws || req.body.token_ws) as string;
    const cobrosIds = req.body.cobrosIds as number[];
    const colegioId = req.body.colegioId as number;
    if (!token) {
      res.status(400).json({ success: false, message: "Token no proporcionado" });
      return;
    }
    const resultado = await transaccionService.confirmarPago({
      token,
      cobrosIds,
      colegioId,
      metodoPago: "WEBPAY",
    });
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

export const retornoKhipu = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const paymentId = (req.query.payment_id || req.body.payment_id) as string;
    const cobrosIds = req.body.cobrosIds as number[];
    const colegioId = req.body.colegioId as number;
    if (!paymentId) {
      res.status(400).json({ success: false, message: "payment_id no proporcionado" });
      return;
    }
    const resultado = await transaccionService.confirmarPago({
      token: paymentId,
      cobrosIds,
      colegioId,
      metodoPago: "KHIPU",
    });
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

export const confirmarTransferenciaManual = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { cobrosIds } = req.body as { cobrosIds: number[] };
    await transaccionService.confirmarTransferenciaManual({
      cobrosIds,
      colegioId: req.user!.colegioId,
    });
    res.status(200).json({ success: true, message: "Transferencia confirmada correctamente" });
  } catch (err) {
    next(err);
  }
};

export const canceladoKhipu = (_req: Request, res: Response): void => {
  logger.info("[ms-pagos] Pago cancelado por el usuario en Khipu");
  res.status(200).json({ success: false, message: "Pago cancelado por el usuario" });
};
