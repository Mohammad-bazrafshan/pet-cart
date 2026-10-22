import { Router } from "express";
import pool from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// ================= REGISTER =================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "لطفاً تمام فیلدها را تکمیل کنید.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "رمز عبور باید حداقل ۸ کاراکتر باشد.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "این ایمیل قبلاً ثبت شده است.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ثبت‌نام عمومی فقط حساب صاحب حیوان ایجاد می‌کند.
    // نقش‌های دیگر از طریق مسیرهای اختصاصی و کنترل‌شده ایجاد می‌شوند.
    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'owner')
      RETURNING id, name, email, role, approval_status
      `,
      [name.trim(), normalizedEmail, hashedPassword],
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(201).json({
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "ثبت‌نام با خطا مواجه شد.",
    });
  }
});

// ================= LOGIN =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "ایمیل و گذرواژه الزامی هستند.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password,
        role,
        approval_status
      FROM users
      WHERE LOWER(email) = $1
      `,
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "ایمیل یا رمز عبور اشتباه است.",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "ایمیل یا رمز عبور اشتباه است.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "ورود با خطا مواجه شد.",
    });
  }
});

// ================= CURRENT USER =================

router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const result = await pool.query(
      `
  SELECT
    id,
    name,
    email,
    role,
    approval_status,
    phone,
    province,
    city,
    address
  FROM users
  WHERE id = $1
  `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "کاربر پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "دریافت اطلاعات کاربر با خطا مواجه شد.",
    });
  }
});

// ================= UPDATE PROFILE =================

router.patch("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "ابتدا وارد حساب کاربری شوید.",
      });
    }

    // این فرم برای پروفایل صاحب حیوان است.
    if (req.user?.role !== "owner") {
      return res.status(403).json({
        message: "شما به این بخش دسترسی ندارید.",
      });
    }

    const { phone, province, city, address } = req.body;

    const fields = { phone, province, city, address };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          message: `مقدار فیلد ${key} معتبر نیست.`,
        });
      }
    }

    const normalized = {
      phone: (phone ?? "").trim(),
      province: (province ?? "").trim(),
      city: (city ?? "").trim(),
      address: (address ?? "").trim(),
    };

    if (
      normalized.phone.length > 20 ||
      normalized.province.length > 100 ||
      normalized.city.length > 100 ||
      normalized.address.length > 2000
    ) {
      return res.status(400).json({
        message: "طول یکی از فیلدها بیش از حد مجاز است.",
      });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET
          phone = $1,
          province = $2,
          city = $3,
          address = $4
        WHERE id = $5
        RETURNING
          id,
          name,
          email,
          role,
          approval_status,
          phone,
          province,
          city,
          address
        `,
      [
        normalized.phone || null,
        normalized.province || null,
        normalized.city || null,
        normalized.address || null,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "کاربر پیدا نشد.",
      });
    }

    return res.json({
      message: "اطلاعات پروفایل با موفقیت ذخیره شد.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "ذخیره اطلاعات پروفایل با خطا مواجه شد.",
    });
  }
});
export default router;
