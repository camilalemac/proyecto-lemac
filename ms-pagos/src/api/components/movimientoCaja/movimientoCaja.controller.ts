import { Request, Response, NextFunction } from "express";
import { movimientoCajaService } from "./movimientoCaja.service";
import { TipoMovimiento } from "../../../models/movimientoCaja.model";

export const listarMovimientos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const movimientos = await movimientoCajaService.listarMovimientosPorCuenta(
      Number(req.params.cuentaId),
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, data: movimientos });
  } catch (err) {
    next(err);
  }
};

export const registrarMovimiento = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      CUENTA_ID,
      CATEGORIA_ID,
      TIPO_MOVIMIENTO,
      GLOSA,
      MONTO,
      COMPROBANTE_URL,
      FECHA_MOVIMIENTO,
    } = req.body as {
      CUENTA_ID: number;
      CATEGORIA_ID: number;
      TIPO_MOVIMIENTO: TipoMovimiento;
      GLOSA: string;
      MONTO: number;
      COMPROBANTE_URL: string | null;
      FECHA_MOVIMIENTO: Date;
    };
    const movimiento = await movimientoCajaService.registrarMovimiento({
      COLEGIO_ID: req.user!.colegioId,
      CUENTA_ID,
      RESPONSABLE_ID: req.user!.userId,
      CATEGORIA_ID,
      TIPO_MOVIMIENTO,
      GLOSA,
      MONTO,
      COMPROBANTE_URL: COMPROBANTE_URL ?? null,
      FECHA_MOVIMIENTO,
    });
    res.status(201).json({ success: true, data: movimiento });
  } catch (err) {
    next(err);
  }
};

export const eliminarMovimiento = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await movimientoCajaService.eliminarMovimiento(
      Number(req.params.movimientoId),
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, message: "Movimiento eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
