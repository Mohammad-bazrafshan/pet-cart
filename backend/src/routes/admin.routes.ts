import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";

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
  }
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
  }
);

router.patch(
  "/users/:id/role",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      const allowedRoles = [
        "owner",
        "veterinarian",
        "admin",
      ];

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
        [role, userId]
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
  }
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
          c.created_at
        ORDER BY c.created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Admin clinics error:", error);

      res.status(500).json({
        message: "دریافت لیست کلینیک‌ها با خطا مواجه شد.",
      });
    }
  }
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
          created_at
        FROM clinics
        WHERE id = $1
        `,
        [clinicId]
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
          u.name,
          u.email,
          v.specialty
        FROM veterinarians v
        INNER JOIN users u
          ON u.id = v.user_id
        WHERE v.clinic_id = $1
        ORDER BY u.name
        `,
        [clinicId]
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
  }
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
        [clinicId]
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
        [Number(userId)]
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
        [Number(userId)]
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
        [
          Number(userId),
          clinicId,
          specialty.trim(),
        ]
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
      console.error(
        "Assign veterinarian to clinic error:",
        error
      );

      res.status(500).json({
        message:
          "اتصال دامپزشک به کلینیک با خطا مواجه شد.",
      });
    }
  }
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
      console.error(
        "Available veterinarians error:",
        error
      );

      res.status(500).json({
        message:
          "دریافت لیست دامپزشکان آزاد با خطا مواجه شد.",
      });
    }
  }
);

router.post(
  "/clinics",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const {
        name,
        phone,
        address,
        description,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "نام کلینیک الزامی است.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO clinics (
          name,
          phone,
          address,
          description
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          name,
          phone,
          address,
          description,
          created_at
        `,
        [
          name.trim(),
          phone?.trim() || null,
          address?.trim() || null,
          description?.trim() || null,
        ]
      );

      res.status(201).json({
        message: "کلینیک با موفقیت ایجاد شد.",
        clinic: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create clinic error:",
        error
      );

      res.status(500).json({
        message:
          "ایجاد کلینیک با خطا مواجه شد.",
      });
    }
  }
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

      const { name, phone, address, description } = req.body;

      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "نام کلینیک الزامی است.",
        });
      }

      const result = await pool.query(
        `
        UPDATE clinics
        SET
          name = $1,
          phone = $2,
          address = $3,
          description = $4
        WHERE id = $5
        RETURNING
          id,
          name,
          phone,
          address,
          description,
          created_at
        `,
        [
          name.trim(),
          typeof phone === "string" && phone.trim()
            ? phone.trim()
            : null,
          typeof address === "string" && address.trim()
            ? address.trim()
            : null,
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
          clinicId,
        ]
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
  }
);


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
          phone,
          city,
          description,
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
  }
);

/* تأیید یا رد درخواست همکاری */
router.patch(
  "/cooperation-requests/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        message: "شناسه درخواست معتبر نیست.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "وضعیت درخواست معتبر نیست.",
      });
    }

    let client;

    try {
      client = await pool.connect();

      await client.query("BEGIN");

      // قفل کردن درخواست تا از پردازش هم‌زمان جلوگیری شود
      const requestResult = await client.query(
        `
        SELECT *
        FROM clinic_cooperation_requests
        WHERE id = $1
        FOR UPDATE
        `,
        [requestId]
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

      // در صورت تأیید، ابتدا کلینیک را ایجاد می‌کنیم
      if (status === "approved") {
        const clinicResult = await client.query(
          `
          INSERT INTO clinics (
            name,
            phone,
            address,
            description
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [
            request.clinic_name,
            request.phone,
            request.city,
            request.description,
          ]
        );

        clinic = clinicResult.rows[0];
      }

      // تغییر وضعیت درخواست
      const updateResult = await client.query(
        `
        UPDATE clinic_cooperation_requests
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, requestId]
      );

      await client.query("COMMIT");

      return res.json({
        message:
          status === "approved"
            ? "درخواست تأیید شد و کلینیک ایجاد شد."
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
  }
);

export default router;