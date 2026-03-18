import { Request, Response, NextFunction } from "express";
import { cuentaBancariaService } from "./cuentaBancaria.service";

export const listarCuentas = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cuentas = await cuentaBancariaService.listarCuentas(req.user!.colegioId);
    res.status(200).json({ success: true, data: cuentas });
  } catch (err) {
    next(err);
  }
};

export const obtenerCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cuenta = await cuentaBancariaService.obtenerCuenta(
      Number(req.params.cuentaId),
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, data: cuenta });
  } catch (err) {
    next(err);
  }
};

export const crearCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { CURSO_ID, NOMBRE_CUENTA, BANCO } = req.body as {
      CURSO_ID: number | null;
      NOMBRE_CUENTA: string;
      BANCO: string;
    };
    const cuenta = await cuentaBancariaService.crearCuenta({
      COLEGIO_ID: req.user!.colegioId,
      CURSO_ID: CURSO_ID ?? null,
      NOMBRE_CUENTA,
      BANCO,
    });
    res.status(201).json({ success: true, data: cuenta });
  } catch (err) {
    next(err);
  }
};

export const abrirCaja = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cuentaOrigenId, cuentaDestinoId } = req.body as {
      cuentaOrigenId: number;
      cuentaDestinoId: number;
    };
    const resultado = await cuentaBancariaService.abrirCaja(
      cuentaOrigenId,
      cuentaDestinoId,
      req.user!.colegioId,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Apertura de caja realizada correctamente",
        data: resultado,
      });
  } catch (err) {
    next(err);
  }
};

export const actualizarCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cuenta = await cuentaBancariaService.actualizarCuenta(
      Number(req.params.cuentaId),
      req.user!.colegioId,
      req.body as Partial<{ NOMBRE_CUENTA: string; BANCO: string; ACTIVO: boolean }>,
    );
    res.status(200).json({ success: true, data: cuenta });
  } catch (err) {
    next(err);
  }
};

export const eliminarCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await cuentaBancariaService.eliminarCuenta(Number(req.params.cuentaId), req.user!.colegioId);
    res.status(200).json({ success: true, message: "Cuenta bancaria eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};
