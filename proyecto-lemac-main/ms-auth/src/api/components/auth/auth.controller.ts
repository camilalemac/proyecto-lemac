import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import { ApiError } from "../../../utils/ApiError";

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const dispositivo = req.headers["user-agent"] ?? "unknown";
  const ipOrigen = req.ip;

  const tokens = await authService.login(email, password, String(dispositivo), ipOrigen);
  res.status(200).json({ success: true, data: tokens });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await authService.register(payload);
  res.status(201).json({ success: true, data: user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const dispositivo = req.headers["user-agent"] ?? "unknown";
  const ipOrigen = req.ip;

  const tokens = await authService.refresh(refreshToken, String(dispositivo), ipOrigen);
  res.status(200).json({ success: true, data: tokens });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(400, "Authorization header missing");
  }

  const accessToken = authHeader.split(" ")[1];
  await authService.logout(accessToken);
  res.status(200).json({ success: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.status(200).json({ success: true, data: user });
});
