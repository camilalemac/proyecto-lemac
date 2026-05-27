import { Request, Response, NextFunction } from "express";
import { categoriaService } from "./categoria.service";

export const listarCategorias = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categorias = await categoriaService.listarCategorias(req.user!.colegioId);
    res.status(200).json({ success: true, data: categorias });
  } catch (err) {
    next(err);
  }
};

export const obtenerCategoria = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categoria = await categoriaService.obtenerCategoria(
      Number(req.params.categoriaId),
      req.user!.colegioId,
    );
    res.status(200).json({ success: true, data: categoria });
  } catch (err) {
    next(err);
  }
};

export const crearCategoria = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { NOMBRE, DESCRIPCION } = req.body as { NOMBRE: string; DESCRIPCION: string | null };
    const categoria = await categoriaService.crearCategoria({
      COLEGIO_ID: req.user!.colegioId,
      NOMBRE,
      DESCRIPCION: DESCRIPCION ?? null,
    });
    res.status(201).json({ success: true, data: categoria });
  } catch (err) {
    next(err);
  }
};

export const actualizarCategoria = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categoria = await categoriaService.actualizarCategoria(
      Number(req.params.categoriaId),
      req.user!.colegioId,
      req.body as Partial<{ NOMBRE: string; DESCRIPCION: string | null }>,
    );
    res.status(200).json({ success: true, data: categoria });
  } catch (err) {
    next(err);
  }
};

export const eliminarCategoria = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await categoriaService.eliminarCategoria(Number(req.params.categoriaId), req.user!.colegioId);
    res.status(200).json({ success: true, message: "Categoría eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};
