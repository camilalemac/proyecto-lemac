import { Request, Response, NextFunction } from "express";
import { nivelService } from "./nivel.service";

export const listarNiveles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const niveles = await nivelService.listarNiveles(colegioId);
    res.status(200).json({ success: true, data: niveles });
  } catch (err) {
    next(err);
  }
};

export const obtenerNivel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const nivelId = Number(req.params.nivelId);
    const nivel = await nivelService.obtenerNivel(nivelId, colegioId);
    res.status(200).json({ success: true, data: nivel });
  } catch (err) {
    next(err);
  }
};

export const crearNivel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const { NOMBRE, NOMBRE_CORTO, GRADO_MINEDUC } = req.body as {
      NOMBRE: string;
      NOMBRE_CORTO: string;
      GRADO_MINEDUC: number;
    };

    const nivel = await nivelService.crearNivel({
      COLEGIO_ID: colegioId,
      NOMBRE,
      NOMBRE_CORTO,
      GRADO_MINEDUC,
    });

    res.status(201).json({ success: true, data: nivel });
  } catch (err) {
    next(err);
  }
};

export const actualizarNivel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const nivelId = Number(req.params.nivelId);
    const data = req.body as Partial<{
      NOMBRE: string;
      NOMBRE_CORTO: string;
      GRADO_MINEDUC: number;
    }>;

    const nivel = await nivelService.actualizarNivel(nivelId, colegioId, data);
    res.status(200).json({ success: true, data: nivel });
  } catch (err) {
    next(err);
  }
};

export const eliminarNivel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const colegioId = req.user!.colegioId;
    const nivelId = Number(req.params.nivelId);
    await nivelService.eliminarNivel(nivelId, colegioId);
    res.status(200).json({ success: true, message: "Nivel eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
