import { Request, Response, NextFunction } from "express";
import { correoService } from "./correo.service";

export const enviarPagosPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await correoService.enviarPagosPendientes(req.body);
    res
      .status(200)
      .json({ success: true, message: "Correo de pagos pendientes enviado correctamente" });
  } catch (err) {
    next(err);
  }
};

export const enviarConfirmacionPago = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await correoService.enviarConfirmacionPago(req.body);
    res.status(200).json({ success: true, message: "Confirmación de pago enviada correctamente" });
  } catch (err) {
    next(err);
  }
};

export const enviarRecuperacionClave = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await correoService.enviarRecuperacionClave(req.body);
    res
      .status(200)
      .json({ success: true, message: "Correo de recuperación enviado correctamente" });
  } catch (err) {
    next(err);
  }
};
