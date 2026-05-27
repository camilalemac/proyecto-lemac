import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { jwtConfig } from "../../config";
import { User } from "../../models";

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization header missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, jwtConfig.secret) as any;
    const user = await User.findOne({ where: { userId: payload.userId, estado: "ACTIVO" } });
    if (!user) throw new Error("User not found");

    (req as any).user = {
      userId: user.userId,
      colegioId: user.colegioId,
      email: user.email,
    };

    next();
  } catch (err) {
    next(new ApiError(401, "Token inválido"));
  }
};
