import { Request, Response, NextFunction } from "express";
import * as identityService from "./identity.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await identityService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await identityService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await identityService.refresh(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await identityService.logout((req as any).user?.sub as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // EL CAMBIO CLAVE: Leemos 'userId' directamente del token decodificado, no 'sub'
    const tokenUserId = (req as any).user?.userId;

    const userId = Number(tokenUserId);

    if (isNaN(userId) || userId === 0) {
      return res.status(400).json({
        status: "error",
        message: "El token no contiene un userId válido",
      });
    }

    // Llamamos a nuestro servicio que ya refactorizamos para devolver el JSON perfecto
    const result = await identityService.me(userId);

    // Devolvemos el status "success" como pidió el equipo de base de datos
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const findByRut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rutCuerpo, rutDv } = req.query as { rutCuerpo: string; rutDv: string };
    const result = await identityService.findByRut(rutCuerpo, rutDv);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recibimos los datos del body de la petición
    const userData = req.body;

    // Llamamos al servicio
    const result = await identityService.createUser(userData);

    // Devolvemos status 201 (Created) con el formato acordado
    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("🚨 ERROR REAL:", error); // Añade esta línea
    next(error);
  }
};
