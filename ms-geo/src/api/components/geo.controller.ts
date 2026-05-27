import { Request, Response, NextFunction } from 'express';
import * as geoService from './geo.service';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const getRegiones = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const regiones = await geoService.getRegiones();
  res.status(200).json({
    success: true,
    data: regiones,
  });
});

export const getProvincias = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const idRegion = Number(req.params.idRegion);
  const provincias = await geoService.getProvinciasByRegion(idRegion);
  res.status(200).json({
    success: true,
    data: provincias,
  });
});

export const getComunas = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const idProvincia = Number(req.params.idProvincia);
  const comunas = await geoService.getComunasByProvincia(idProvincia);
  res.status(200).json({
    success: true,
    data: comunas,
  });
});
