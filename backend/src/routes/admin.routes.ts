import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";
import path from "node:path";
import { access } from "node:fs/promises";
import bcrypt from "bcrypt";
const router = Router();

router.get(
  "/dashboard",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users) AS users_count,
          (SELECT COUNT(*) FROM clinics) AS clinics_count,
          (
            SELECT COUNT(*)
            FROM users
            WHERE role = 'veterinarian'
          ) AS veterinarians_count
      `);

      const stats = result.rows[0];

      res.json({
        users: Number(stats.users_count),
        clinics: Number(stats.clinics_count),
        veterinarians: Number(stats.veterinarians_count),
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);

      res.status(500).json({
        message: "دریافت آمار داشبورد مدیریت با خطا مواجه شد.",
      });
    }
  },
);

router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Admin users error:", error);

      res.status(500).json({
        message: "دریافت لیست کاربران با خطا مواجه شد.",
      });
    }
  },
);

router.patch(
  "/users/:id/role",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      const allowedRoles = ["owner", "veterinarian", "admin"];

      // بررسی id
      if (!Number.isInteger(userId)) {
        return res.status(400).json({
          message: "شناسه کاربر نامعتبر است.",
        });
      }

      // بررسی role
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "نقش انتخاب‌شده معتبر نیست.",
        });
      }

      // جلوگیری از تغییر نقش خود ادمین
      if (req.user?.id === userId) {
        return res.status(400).json({
          message: "امکان تغییر نقش حساب خودتان وجود ندارد.",
        });
      }

      const result = await pool.query(
        `
        UPDATE users
        SET role = $1
        WHERE id = $2
        RETURNING id, name, email, role, created_at
        `,
        [role, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "کاربر موردنظر پیدا نشد.",
        });
      }

      res.json({
        message: "نقش کاربر با موفقیت تغییر کرد.",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Change user role error:", error);

      res.status(500).json({
        message: "تغییر نقش کاربر با خطا مواجه شد.",
      });
    }
  },
);
router.get(
  "/clinics",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT
          c.id,
          c.name,
          c.phone,
          c.address,
          c.description,
          c.created_at,
          c.province,
          c.city,
          COUNT(v.id)::int AS veterinarians_count
        FROM clinics c
        LEFT JOIN veterinarians v
          ON v.clinic_id = c.id
        GROUP BY
          c.id,
          c.name,
          c.phone,
          c.address,
          c.description,
          c.created_at,
          c.province,
          c.city
        ORDER BY c.created_at DESC
      `);

      return res.json(result.rows);
    } catch (error) {
      console.error("Admin clinics error:", error);

      return res.status(500).json({
        message: "دریافت لیست کلینیک‌ها با خطا مواجه شد.",
      });
    }
  },
);

router.get(
  "/clinics/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const clinicId = Number(req.params.id);

      if (!Number.isInteger(clinicId)) {
        return res.status(400).json({
          message: "شناسه کلینیک نامعتبر است.",
        });
      }

      const clinicResult = await pool.query(
        `
        SELECT
          id,
          name,
          phone,
          address,
          description,
          created_at,
          manager_name,
          province,
          city,
          vet_license_number
        FROM clinics
        WHERE id = $1
        `,
        [clinicId],
      );

      if (clinicResult.rows.length === 0) {
        return res.status(404).json({
          message: "کلینیک موردنظر پیدا نشد.",
        });
      }

      const veterinariansResult = await pool.query(
        `
  SELECT
    v.id,
    COALESCE(v.full_name, u.name) AS name,
    u.email,
    v.phone,
    v.license_number,
    v.specialty
  FROM veterinarians v
  LEFT JOIN users u ON u.id = v.user_id
  WHERE v.clinic_id = $1
  ORDER BY COALESCE(v.full_name, u.name) NULLS LAST
  `,
        [clinicId],
      );

      res.json({
        ...clinicResult.rows[0],
        veterinarians: veterinariansResult.rows,
      });
    } catch (error) {
      console.error("Admin clinic details error:", error);

      res.status(500).json({
        message: "دریافت جزئیات کلینیک با خطا مواجه شد.",
      });
    }
  },
);

// ثبت دامپزشک جدید همراه با حساب کاربری
router.post(
  "/veterinarians",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      const {
        fullName,
        email,
        password,
        phone,
        licenseNumber,
        specialty,
        clinicId,
      } = req.body;

      // اعتبارسنجی اطلاعات
      if (
        typeof fullName !== "string" ||
        !fullName.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        password.length < 8 ||
        typeof phone !== "string" ||
        !phone.trim() ||
        typeof licenseNumber !== "string" ||
        !licenseNumber.trim() ||
        typeof specialty !== "string" ||
        !specialty.trim() ||
        !Number.isInteger(Number(clinicId)) ||
        Number(clinicId) <= 0
      ) {
        return res.status(400).json({
          message: "اطلاعات را کامل کنید. رمز عبور باید حداقل ۸ کاراکتر باشد.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      await client.query("BEGIN");
      transactionStarted = true;

      // بررسی وجود کلینیک
      const clinicResult = await client.query(
        "SELECT id FROM clinics WHERE id = $1",
        [Number(clinicId)],
      );

      if (clinicResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "کلینیک موردنظر پیدا نشد.",
        });
      }

      // بررسی تکراری نبودن ایمیل
      const existingUser = await client.query(
        "SELECT id FROM users WHERE LOWER(email) = $1",
        [normalizedEmail],
      );

      if (existingUser.rows.length > 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "این ایمیل قبلاً ثبت شده است.",
        });
      }

      // بررسی تکراری نبودن شماره نظام دامپزشکی
      const existingVet = await client.query(
        `SELECT id FROM veterinarians WHERE license_number = $1`,
        [licenseNumber.trim()],
      );

      if (existingVet.rows.length > 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "این شماره نظام دامپزشکی قبلاً ثبت شده است.",
        });
      }

      // هش کردن رمز عبور
      const hashedPassword = await bcrypt.hash(password, 10);

      // ایجاد حساب کاربری دامپزشک
      const userResult = await client.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'veterinarian')
        RETURNING id, name, email, role
        `,
        [fullName.trim(), normalizedEmail, hashedPassword],
      );

      const newUser = userResult.rows[0];

      // اتصال حساب کاربری به اطلاعات دامپزشک
      const vetResult = await client.query(
        `
        INSERT INTO veterinarians (
          user_id,
          clinic_id,
          full_name,
          phone,
          license_number,
          specialty
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          user_id,
          clinic_id,
          full_name,
          phone,
          license_number,
          specialty
        `,
        [
          newUser.id,
          Number(clinicId),
          fullName.trim(),
          phone.trim(),
          licenseNumber.trim(),
          specialty.trim(),
        ],
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return res.status(201).json({
        message: "حساب کاربری و اطلاعات دامپزشک با موفقیت ثبت شدند.",
        user: newUser,
        veterinarian: vetResult.rows[0],
      });
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK");
      }

      console.error("Create veterinarian error:", error);

      return res.status(500).json({
        message: "ثبت دامپزشک با خطا مواجه شد.",
      });
    } finally {
      client.release();
    }
  },
);
router.post(
  "/clinics/:clinicId/veterinarians",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const clinicId = Number(req.params.clinicId);
      const { userId, specialty } = req.body;

      if (!Number.isInteger(clinicId)) {
        return res.status(400).json({
          message: "شناسه کلینیک نامعتبر است.",
        });
      }

      if (!Number.isInteger(Number(userId))) {
        return res.status(400).json({
          message: "شناسه دامپزشک نامعتبر است.",
        });
      }

      if (!specialty || !specialty.trim()) {
        return res.status(400).json({
          message: "تخصص دامپزشک الزامی است.",
        });
      }

      // بررسی وجود کلینیک
      const clinicResult = await pool.query(
        `
        SELECT id
        FROM clinics
        WHERE id = $1
        `,
        [clinicId],
      );

      if (clinicResult.rows.length === 0) {
        return res.status(404).json({
          message: "کلینیک موردنظر پیدا نشد.",
        });
      }

      // بررسی اینکه کاربر وجود دارد و نقش او veterinarian است
      const userResult = await pool.query(
        `
        SELECT id, name, email, role
        FROM users
        WHERE id = $1
        `,
        [Number(userId)],
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "کاربر موردنظر پیدا نشد.",
        });
      }

      const user = userResult.rows[0];

      if (user.role !== "veterinarian") {
        return res.status(400).json({
          message: "این کاربر نقش دامپزشک ندارد.",
        });
      }

      // بررسی اینکه دامپزشک قبلاً به یک کلینیک متصل نشده باشد
      const existingVet = await pool.query(
        `
        SELECT id, clinic_id
        FROM veterinarians
        WHERE user_id = $1
        `,
        [Number(userId)],
      );

      if (existingVet.rows.length > 0) {
        return res.status(409).json({
          message: "این دامپزشک قبلاً به یک کلینیک متصل شده است.",
        });
      }

      // اتصال دامپزشک به کلینیک
      const result = await pool.query(
        `
        INSERT INTO veterinarians (
          user_id,
          clinic_id,
          specialty
        )
        VALUES ($1, $2, $3)
        RETURNING id, user_id, clinic_id, specialty
        `,
        [Number(userId), clinicId, specialty.trim()],
      );

      res.status(201).json({
        message: "دامپزشک با موفقیت به کلینیک متصل شد.",
        veterinarian: {
          id: result.rows[0].id,
          userId: result.rows[0].user_id,
          clinicId: result.rows[0].clinic_id,
          specialty: result.rows[0].specialty,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Assign veterinarian to clinic error:", error);

      res.status(500).json({
        message: "اتصال دامپزشک به کلینیک با خطا مواجه شد.",
      });
    }
  },
);

router.get(
  "/veterinarians/available",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT
          u.id,
          u.name,
          u.email
        FROM users u
        LEFT JOIN veterinarians v
          ON v.user_id = u.id
        WHERE
          u.role = 'veterinarian'
          AND v.id IS NULL
        ORDER BY u.name
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Available veterinarians error:", error);

      res.status(500).json({
        message: "دریافت لیست دامپزشکان آزاد با خطا مواجه شد.",
      });
    }
  },
);
router.post(
  "/clinics",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const { name, phone, address, description, province, city } = req.body;

      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "نام کلینیک الزامی است.",
        });
      }

      if (typeof province !== "string" || !province.trim()) {
        return res.status(400).json({
          message: "انتخاب استان الزامی است.",
        });
      }

      if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({
          message: "انتخاب شهر الزامی است.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO clinics (
          name,
          phone,
          address,
          description,
          province,
          city
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          name,
          phone,
          address,
          description,
          province,
          city,
          created_at
        `,
        [
          name.trim(),
          typeof phone === "string" && phone.trim() ? phone.trim() : null,
          typeof address === "string" && address.trim() ? address.trim() : null,
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
          province.trim(),
          city.trim(),
        ],
      );

      return res.status(201).json({
        message: "کلینیک با موفقیت ایجاد شد.",
        clinic: result.rows[0],
      });
    } catch (error) {
      console.error("Create clinic error:", error);

      return res.status(500).json({
        message: "ایجاد کلینیک با خطا مواجه شد.",
      });
    }
  },
);

router.patch(
  "/clinics/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const clinicId = Number(req.params.id);

      if (!Number.isInteger(clinicId) || clinicId <= 0) {
        return res.status(400).json({
          message: "شناسه کلینیک معتبر نیست.",
        });
      }

      const { name, phone, address, description, province, city } = req.body;

      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "نام کلینیک الزامی است.",
        });
      }

      if (typeof province !== "string" || !province.trim()) {
        return res.status(400).json({
          message: "انتخاب استان الزامی است.",
        });
      }

      if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({
          message: "انتخاب شهر الزامی است.",
        });
      }

      const result = await pool.query(
        `
        UPDATE clinics
        SET
          name = $1,
          phone = $2,
          address = $3,
          description = $4,
          province = $5,
          city = $6
        WHERE id = $7
        RETURNING
          id,
          name,
          phone,
          address,
          description,
          province,
          city,
          created_at
        `,
        [
          name.trim(),
          typeof phone === "string" && phone.trim() ? phone.trim() : null,
          typeof address === "string" && address.trim() ? address.trim() : null,
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
          province.trim(),
          city.trim(),
          clinicId,
        ],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "کلینیک موردنظر پیدا نشد.",
        });
      }

      return res.status(200).json({
        message: "اطلاعات کلینیک با موفقیت ویرایش شد.",
        clinic: result.rows[0],
      });
    } catch (error) {
      console.error("Update clinic error:", error);

      return res.status(500).json({
        message: "ویرایش اطلاعات کلینیک با خطا مواجه شد.",
      });
    }
  },
);

router.delete(
  "/clinics/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    let client: Awaited<ReturnType<typeof pool.connect>> | undefined;
    let transactionStarted = false;

    try {
      const clinicId = Number(req.params.id);

      // بررسی شناسه کلینیک
      if (!Number.isInteger(clinicId) || clinicId <= 0) {
        return res.status(400).json({
          message: "شناسه کلینیک معتبر نیست.",
        });
      }

      client = await pool.connect();

      await client.query("BEGIN");
      transactionStarted = true;

      // بررسی وجود کلینیک و قفل کردن رکورد تا پایان تراکنش
      const clinicResult = await client.query(
        `
        SELECT id, name
        FROM clinics
        WHERE id = $1
        FOR UPDATE
        `,
        [clinicId],
      );

      if (clinicResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "کلینیک موردنظر پیدا نشد.",
        });
      }

      // جلوگیری از حذف کلینیکی که دامپزشک وابسته دارد
      const veterinariansResult = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM veterinarians
        WHERE clinic_id = $1
        `,
        [clinicId],
      );

      const veterinariansCount = veterinariansResult.rows[0].count;

      if (veterinariansCount > 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message:
            "این کلینیک دامپزشک وابسته دارد. ابتدا دامپزشکان آن را به کلینیک دیگری منتقل کنید یا وابستگی‌هایشان را از طریق فرایند مدیریتی مناسب برطرف کنید.",
        });
      }

      // حذف کلینیک
      await client.query(
        `
        DELETE FROM clinics
        WHERE id = $1
        `,
        [clinicId],
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return res.status(200).json({
        message: "کلینیک با موفقیت حذف شد.",
      });
    } catch (error) {
      if (transactionStarted && client) {
        await client.query("ROLLBACK").catch(() => {});
      }

      // وجود وابستگی در سایر جداول دیتابیس
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23503"
      ) {
        return res.status(409).json({
          message:
            "این کلینیک دارای اطلاعات وابسته در سیستم است و فعلاً قابل حذف نیست.",
        });
      }

      console.error("Delete clinic error:", error);

      return res.status(500).json({
        message: "حذف کلینیک با خطا مواجه شد.",
      });
    } finally {
      client?.release();
    }
  },
);
/* دریافت درخواست‌های همکاری کلینیک */

/* دریافت درخواست‌های همکاری کلینیک */
router.get(
  "/cooperation-requests",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT
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
  (license_document_path IS NOT NULL) AS has_license_document,
  status,
  created_at
FROM clinic_cooperation_requests
ORDER BY
  CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
  created_at DESC
      `);

      return res.json(result.rows);
    } catch (error) {
      console.error("Get cooperation requests error:", error);

      return res.status(500).json({
        message: "دریافت درخواست‌های همکاری با خطا مواجه شد.",
      });
    }
  },
);

/* دریافت امن پروانه فعالیت کلینیک برای ادمین */
router.get(
  "/cooperation-requests/:id/license-document",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const requestId = Number(req.params.id);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        return res.status(400).json({
          message: "شناسه درخواست معتبر نیست.",
        });
      }

      const result = await pool.query(
        `
        SELECT license_document_path
        FROM clinic_cooperation_requests
        WHERE id = $1
        `,
        [requestId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "درخواست همکاری پیدا نشد.",
        });
      }

      const storedPath = result.rows[0].license_document_path;

      if (!storedPath) {
        return res.status(404).json({
          message: "پروانه‌ای برای این درخواست ثبت نشده است.",
        });
      }

      // باید با مسیر ذخیره‌سازی فایل در clinics.routes.ts یکسان باشد.
      const uploadDirectory = path.resolve(
        process.cwd(),
        "private-uploads",
        "clinic-licenses",
      );

      const filePath = path.resolve(uploadDirectory, storedPath);
      const relativePath = path.relative(uploadDirectory, filePath);

      // جلوگیری از دسترسی به فایل‌های خارج از پوشه پروانه‌ها
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return res.status(400).json({
          message: "مسیر فایل معتبر نیست.",
        });
      }

      try {
        await access(filePath);
      } catch {
        return res.status(404).json({
          message: "فایل پروانه در سرور پیدا نشد.",
        });
      }

      const extension = path.extname(filePath).toLowerCase();

      const allowedTypes: Record<string, string> = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
      };

      const contentType = allowedTypes[extension];

      if (!contentType) {
        return res.status(415).json({
          message: "نوع فایل پروانه پشتیبانی نمی‌شود.",
        });
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("X-Content-Type-Options", "nosniff");

      return res.download(
        filePath,
        `clinic-license-${requestId}${extension}`,
        (error) => {
          if (error) {
            console.error("Download clinic license error:", error);

            if (!res.headersSent) {
              res.status(500).json({
                message: "دریافت فایل پروانه با خطا مواجه شد.",
              });
            }
          }
        },
      );
    } catch (error) {
      console.error("Get clinic license error:", error);

      return res.status(500).json({
        message: "دریافت فایل پروانه با خطا مواجه شد.",
      });
    }
  },
);

/* تأیید یا رد درخواست همکاری */
router.patch(
  "/cooperation-requests/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        message: "شناسه درخواست معتبر نیست.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "وضعیت درخواست معتبر نیست.",
      });
    }

    let client: Awaited<ReturnType<typeof pool.connect>> | undefined;

    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const requestResult = await client.query(
        `
        SELECT *
        FROM clinic_cooperation_requests
        WHERE id = $1
        FOR UPDATE
        `,
        [requestId],
      );

      if (requestResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "درخواست همکاری پیدا نشد.",
        });
      }

      const request = requestResult.rows[0];

      if (request.status !== "pending") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: "این درخواست قبلاً بررسی شده است.",
        });
      }

      let clinic = null;

      if (status === "approved") {
        // ۱. ساخت کلینیک با اطلاعات درخواست
        const clinicResult = await client.query(
          `
          INSERT INTO clinics (
            name,
            phone,
            address,
            description,
            manager_name,
            province,
            city,
            vet_license_number
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
          `,
          [
            request.clinic_name,
            request.phone,
            request.address,
            request.description,
            request.manager_name,
            request.province,
            request.city,
            request.vet_license_number,
          ],
        );

        clinic = clinicResult.rows[0];

        // ۲. ثبت دامپزشک مسئول بدون نیاز به حساب کاربری
        await client.query(
          `
          INSERT INTO veterinarians (
            user_id,
            clinic_id,
            specialty,
            full_name,
            phone,
            license_number
          )
          VALUES (NULL, $1, $2, $3, $4, $5)
          `,
          [
            clinic.id,
            request.vet_specialty,
            request.vet_full_name || request.manager_name,
            request.vet_phone,
            request.vet_license_number,
          ],
        );
      }

      // ۳. به‌روزرسانی وضعیت درخواست
      const updateResult = await client.query(
        `
        UPDATE clinic_cooperation_requests
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, requestId],
      );

      await client.query("COMMIT");

      return res.json({
        message:
          status === "approved"
            ? "درخواست تأیید شد و کلینیک و دامپزشک مسئول ثبت شدند."
            : "درخواست همکاری رد شد.",
        request: updateResult.rows[0],
        clinic,
      });
    } catch (error) {
      if (client) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Review cooperation request error:", error);

      return res.status(500).json({
        message: "بررسی درخواست همکاری با خطا مواجه شد.",
      });
    } finally {
      client?.release();
    }
  },
);
export default router;
