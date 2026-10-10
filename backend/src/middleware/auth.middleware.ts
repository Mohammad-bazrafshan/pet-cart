import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "احراز هویت انجام نشده است.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded as AuthRequest["user"];

    next();
  } catch (error) {
    return res.status(401).json({
      message: "توکن نامعتبر یا منقضی شده است.",
    });
  }
}
export function requireRole(...allowedRoles: string[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "شما اجازه دسترسی به این بخش را ندارید.",
      });
    }

    next();
  };
}