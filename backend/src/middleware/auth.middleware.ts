import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";

// بررسی تنظیم بودن کلید JWT
const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

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

// بررسی و اعتبارسنجی توکن
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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

    if (typeof decoded !== "object" || decoded === null) {
      return res.status(401).json({
        message: "ساختار توکن معتبر نیست.",
      });
    }

    const id: unknown = decoded["id"];
    const email: unknown = decoded["email"];
    const role: unknown = decoded["role"];

    if (
      typeof id !== "number" ||
      !Number.isInteger(id) ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(401).json({
        message: "ساختار توکن معتبر نیست.",
      });
    }

    req.user = {
      id,
      email,
      role,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "توکن نامعتبر یا منقضی شده است.",
    });
  }
}

// محدود کردن دسترسی بر اساس نقش
export function requireRole(...allowedRoles: string[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
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

    return next();
  };
}

// بررسی نقش و وضعیت تأیید حساب از دیتابیس
export async function requireApprovedProvider(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const userId = currentUser.id;

    const result = await pool.query(
      `
      SELECT role, approval_status
      FROM users
      WHERE id = $1
      `,
      [userId],
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

    // نقش فعلی دیتابیس جایگزین نقش داخل توکن می‌شود
    currentUser.role = user.role;

    return next();
  } catch (error) {
    console.error("Provider approval check error:", error);

    return res.status(500).json({
      message: "بررسی وضعیت حساب با خطا مواجه شد.",
    });
  }
}