
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";

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

// بررسی توکن
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

    if (
      typeof decoded === "string" ||
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "number" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return res.status(401).json({
        message: "ساختار توکن معتبر نیست.",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "توکن نامعتبر یا منقضی شده است.",
    });
  }
}

// محدودکردن دسترسی بر اساس نقش
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

// بررسی نقش و وضعیت فعلی حساب از دیتابیس
export async function requireApprovedProvider(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const result = await pool.query(
      `
      SELECT role, approval_status
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "حساب کاربری پیدا نشد.",
      });
    }

    const user = result.rows[0];

    if (!["trainer", "walker"].includes(user.role)) {
      return res.status(403).json({
        message: "این بخش مخصوص ترینرها و واکرها است.",
      });
    }

    if (user.approval_status !== "approved") {
      return res.status(403).json({
        approvalStatus: user.approval_status,
        message:
          user.approval_status === "pending"
            ? "درخواست شما هنوز توسط ادمین بررسی نشده است."
            : "درخواست همکاری شما تأیید نشده است.",
      });
    }

    // نقش جاری دیتابیس جایگزین نقش داخل توکن می‌شود
    req.user.role = user.role;

    next();
  } catch (error) {
    console.error("Provider approval check error:", error);

    return res.status(500).json({
      message: "بررسی وضعیت حساب با خطا مواجه شد.",
    });
  }
}
