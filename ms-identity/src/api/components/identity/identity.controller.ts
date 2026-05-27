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
    const tokenUserId = (req as any).user?.userId;
    const userId = Number(tokenUserId);

    if (isNaN(userId) || userId === 0) {
      return res.status(400).json({
        status: "error",
        message: "El token no contiene un userId válido",
      });
    }

    // 1. Extraemos el token JWT del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";

    // 2. Le pasamos el token al servicio
    const result = await identityService.me(userId, token);

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
    console.error("🚨 ERROR REAL:", error); 
    next(error);
  }
};

export const getMisHijos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUserId = (req as any).user?.userId;
    const userId = Number(tokenUserId);

    if (isNaN(userId) || userId === 0) {
      return res.status(400).json({
        status: "error",
        message: "El token no contiene un userId válido",
      });
    }

    // 1. Extraemos el token JWT del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";

    // 2. Llamamos al servicio pasándole el userId y el token
    const result = await identityService.getMisHijos(userId, token);

    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await identityService.obtenerUsuario(userId); 
    
    res.status(200).json(user);
  } catch (error) {
    next(error); 
  }
};