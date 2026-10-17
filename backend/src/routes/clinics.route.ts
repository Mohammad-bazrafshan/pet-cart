import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

const router = Router();

const uploadDirectory = path.resolve(
  process.cwd(),
  "private-uploads",
  "clinic-licenses",
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      !allowedExtensions.includes(extension) ||
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      return callback(
        new Error("فقط فایل PDF، JPG و PNG مجاز است."),
      );
    }

    callback(null, true);
  },
});

function removeUploadedFile(filePath?: string) {
  if (filePath) {
    fs.unlink(filePath, (error) => {
      if (error && error.code !== "ENOENT") {
        console.error("Remove uploaded file error:", error);
      }
    });
  }
}

/**
 * POST /api/clinics/cooperation-requests
 * ثبت درخواست همکاری کلینیک به همراه اطلاعات حساب کاربری
 */
router.post(
  "/cooperation-requests",

  (req, res, next) => {
    upload.single("licenseDocument")(req, res, (error) => {
      if (error) {
        const message =
          error instanceof multer.MulterError
            ? "فایل انتخاب‌شده معتبر نیست یا حجم آن بیش از ۵ مگابایت است."
            : error.message;

        return res.status(400).json({ message });
      }

      next();
    });
  },

  async (req, res) => {
    try {
      const {
        clinicName,
        managerName,
        vetLicenseNumber,
        vetFullName,
        vetPhone,
        vetSpecialty,
        phone,
        province,
        city,
        address,
        description,
        email,
        password,
      } = req.body;

      // بررسی فیلدهای الزامی
      const requiredFields = [
        clinicName,
        managerName,
        vetLicenseNumber,
        vetFullName,
        vetPhone,
        vetSpecialty,
        phone,
        province,
        city,
        address,
      ];

      if (
        !requiredFields.every(
          (value) =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
      ) {
        removeUploadedFile(req.file?.path);

        return res.status(400).json({
          message: "لطفاً تمام فیلدهای الزامی را تکمیل کنید.",
        });
      }

      // اعتبارسنجی ایمیل
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        email.trim().length > 254
      ) {
        removeUploadedFile(req.file?.path);

        return res.status(400).json({
          message: "ایمیل معتبر وارد کنید.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // اعتبارسنجی رمز عبور
      if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 72
      ) {
        removeUploadedFile(req.file?.path);

        return res.status(400).json({
          message: "رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد.",
        });
      }

      // اعتبارسنجی فایل پروانه
      if (!req.file) {
        return res.status(400).json({
          message: "بارگذاری پروانه فعالیت کلینیک الزامی است.",
        });
      }

      // اعتبارسنجی طول فیلدها
      const fields = [
        { value: clinicName, max: 150 },
        { value: managerName, max: 150 },
        { value: vetLicenseNumber, max: 50 },
        { value: vetFullName, max: 150 },
        { value: vetPhone, max: 30 },
        { value: vetSpecialty, max: 150 },
        { value: phone, max: 30 },
        { value: province, max: 100 },
        { value: city, max: 100 },
        { value: address, max: 500 },
      ];

      const hasInvalidLength = fields.some(
        ({ value, max }) => value.trim().length > max,
      );

      if (
        hasInvalidLength ||
        (typeof description === "string" &&
          description.trim().length > 2000)
      ) {
        removeUploadedFile(req.file.path);

        return res.status(400).json({
          message: "طول یکی از فیلدهای واردشده بیش از حد مجاز است.",
        });
      }

      if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
      ) {
        removeUploadedFile(req.file.path);

        return res.status(400).json({
          message: "فرمت توضیحات معتبر نیست.",
        });
      }

      // بررسی ایمیل تکراری در حساب‌های موجود و درخواست‌های قبلی
      const existingEmail = await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = $1

        UNION ALL

        SELECT id
        FROM clinic_cooperation_requests
        WHERE LOWER(email) = $1

        LIMIT 1
        `,
        [normalizedEmail],
      );

      if (existingEmail.rowCount && existingEmail.rowCount > 0) {
        removeUploadedFile(req.file.path);

        return res.status(409).json({
          message:
            "با این ایمیل قبلاً حساب کاربری یا درخواست همکاری ثبت شده است.",
        });
      }

      // ذخیره نام فایل؛ فایل خارج از پوشه عمومی قرار دارد
      const documentPath = path
        .relative(uploadDirectory, req.file.path)
        .replace(/\\/g, "/");

      // هش کردن رمز عبور؛ رمز خام ذخیره نمی‌شود
      const passwordHash = await bcrypt.hash(password, 12);

      const result = await pool.query(
        `
        INSERT INTO clinic_cooperation_requests (
          clinic_name,
          manager_name,
          vet_license_number,
          vet_full_name,
          vet_phone,
          vet_specialty,
          phone,
          province,
          city,
          address,
          description,
          license_document_path,
          status,
          email,
          password_hash
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          'pending', $13, $14
        )
        RETURNING
          id,
          clinic_name,
          manager_name,
          vet_license_number,
          vet_full_name,
          vet_phone,
          vet_specialty,
          phone,
          province,
          city,
          address,
          description,
          status,
          created_at
        `,
        [
          clinicName.trim(),
          managerName.trim(),
          vetLicenseNumber.trim(),
          vetFullName.trim(),
          vetPhone.trim(),
          vetSpecialty.trim(),
          phone.trim(),
          province.trim(),
          city.trim(),
          address.trim(),
          typeof description === "string"
            ? description.trim() || null
            : null,
          documentPath,
          normalizedEmail,
          passwordHash,
        ],
      );

      return res.status(201).json({
        message:
          "درخواست همکاری با موفقیت ثبت شد و پس از بررسی ادمین، نتیجه اعلام می‌شود.",
        request: result.rows[0],
      });
    } catch (error) {
      removeUploadedFile(req.file?.path);

      console.error(
        "Create clinic cooperation request error:",
        error,
      );

      return res.status(500).json({
        message: "ثبت درخواست همکاری با خطا مواجه شد.",
      });
    }
  },
);

// GET /api/clinics
router.get("/", authenticateToken, async (_req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM clinics
      ORDER BY name ASC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Get clinics error:", error);

    return res.status(500).json({
      message: "دریافت کلینیک‌ها با خطا مواجه شد.",
    });
  }
});

// GET /api/clinics/:id
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const clinicId = Number(req.params.id);

    if (!Number.isInteger(clinicId) || clinicId <= 0) {
      return res.status(400).json({
        message: "شناسه کلینیک نامعتبر است.",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM clinics
      WHERE id = $1
      `,
      [clinicId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "کلینیک پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get clinic error:", error);

    return res.status(500).json({
      message: "دریافت اطلاعات کلینیک با خطا مواجه شد.",
    });
  }
});

// POST /api/clinics
// حفظ مسیر فعلی ساخت کلینیک
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, phone, address, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "نام کلینیک الزامی است.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO clinics (name, phone, address, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name.trim(),
        typeof phone === "string" ? phone.trim() || null : null,
        typeof address === "string"
          ? address.trim() || null
          : null,
        typeof description === "string"
          ? description.trim() || null
          : null,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create clinic error:", error);

    return res.status(500).json({
      message: "ثبت کلینیک با خطا مواجه شد.",
    });
  }
});

export default router;