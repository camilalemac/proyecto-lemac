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

// Retorno de Webpay — redirige desde el banco con token_ws
export const retornoWebpay = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = (req.query.token_ws || req.body.token_ws) as string;
    if (!token) {
      res.status(400).json({ success: false, message: "Token no proporcionado" });
      return;
    }
    const resultado = await transaccionService.confirmarPago(token);
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

// Retorno de Khipu — redirige desde el banco con payment_id
export const retornoKhipu = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const paymentId = (req.query.payment_id || req.body.payment_id) as string;
    if (!paymentId) {
      res.status(400).json({ success: false, message: "payment_id no proporcionado" });
      return;
    }
    const resultado = await transaccionService.confirmarPago(paymentId);
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

// Confirmación manual de transferencia por el tesorero
export const confirmarTransferenciaManual = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const transaccion = await transaccionService.confirmarTransferenciaManual(
      Number(req.params.transaccionId),
      req.user!.colegioId,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Transferencia confirmada correctamente",
        data: transaccion,
      });
  } catch (err) {
    next(err);
  }
};

export const canceladoKhipu = (_req: Request, res: Response): void => {
  logger.info("[ms-pagos] Pago cancelado por el usuario en Khipu");
  res.status(200).json({ success: false, message: "Pago cancelado por el usuario" });
};
