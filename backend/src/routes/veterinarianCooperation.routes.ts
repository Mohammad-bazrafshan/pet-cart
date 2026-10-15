
import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

/**
 * POST /api/veterinarian-cooperation/applications
 * ثبت درخواست همکاری توسط دامپزشک بدون حساب کاربری
 */
router.post("/applications", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      licenseNumber,
      specialty,
      province,
      city,
      workType,
      description,
      clinicId,
    } = req.body;

    const requiredFields = [
      fullName,
      phone,
      licenseNumber,
      specialty,
      province,
      city,
    ];

    if (
      !requiredFields.every(
        (value) =>
          typeof value === "string" && value.trim().length > 0,
      )
    ) {
      return res.status(400).json({
        message: "لطفاً تمام فیلدهای الزامی را تکمیل کنید.",
      });
    }

    const fields = [
      { value: fullName, max: 150 },
      { value: phone, max: 30 },
      { value: licenseNumber, max: 50 },
      { value: specialty, max: 150 },
      { value: province, max: 100 },
      { value: city, max: 100 },
    ];

    if (
      fields.some(({ value, max }) => value.trim().length > max) ||
      (workType !== undefined &&
        (typeof workType !== "string" ||
          workType.trim().length > 50)) ||
      (description !== undefined &&
        (typeof description !== "string" ||
          description.trim().length > 2000))
    ) {
      return res.status(400).json({
        message: "طول یا قالب یکی از فیلدهای واردشده معتبر نیست.",
      });
    }

    const selectedClinicId = Number(clinicId);

    if (
      !Number.isInteger(selectedClinicId) ||
      selectedClinicId <= 0
    ) {
      return res.status(400).json({
        message: "لطفاً یک کلینیک معتبر انتخاب کنید.",
      });
    }

    const clinicResult = await pool.query(
      `
      SELECT id, province, city
      FROM clinics
      WHERE id = $1
      `,
      [selectedClinicId],
    );

    if (clinicResult.rows.length === 0) {
      return res.status(404).json({
        message: "کلینیک انتخاب‌شده پیدا نشد.",
      });
    }

    const applicationResult = await pool.query(
      `
      INSERT INTO veterinarian_applications (
        full_name,
        phone,
        license_number,
        specialty,
        province,
        city,
        work_type,
        description,
        status,
        clinic_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
      RETURNING
        id,
        full_name,
        phone,
        license_number,
        specialty,
        province,
        city,
        work_type,
        description,
        status,
        clinic_id,
        created_at
      `,
      [
        fullName.trim(),
        phone.trim(),
        licenseNumber.trim(),
        specialty.trim(),
        province.trim(),
        city.trim(),
        typeof workType === "string"
          ? workType.trim() || null
          : null,
        typeof description === "string"
          ? description.trim() || null
          : null,
        selectedClinicId,
      ],
    );

    return res.status(201).json({
      message: "درخواست همکاری با موفقیت ثبت شد.",
      application: applicationResult.rows[0],
      clinic: clinicResult.rows[0],
    });
  } catch (error) {
    console.error("Create veterinarian application error:", error);

    return res.status(500).json({
      message: "ثبت درخواست همکاری با خطا مواجه شد.",
    });
  }
});

/**
 * GET /api/veterinarian-cooperation/clinics
 * نمایش کلینیک‌های ثبت‌شده برای انتخاب
 */
router.get("/clinics", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        phone,
        address,
        description,
        province,
        city
      FROM clinics
      ORDER BY name ASC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Get clinics error:", error);

    return res.status(500).json({
      message: "دریافت فهرست کلینیک‌ها با خطا مواجه شد.",
    });
  }
});

/**
 * GET /api/veterinarian-cooperation/applications/clinic-requests
 * درخواست‌های عمومی مربوط به کلینیک‌های دامپزشک فعلی
 */
router.get(
  "/applications/clinic-requests",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          a.id,
          a.full_name,
          a.phone,
          a.license_number,
          a.specialty,
          a.province,
          a.city,
          a.work_type,
          a.description,
          a.status,
          a.created_at,
          a.clinic_id,
          c.name AS clinic_name
        FROM veterinarian_applications a
        JOIN clinics c ON c.id = a.clinic_id
        WHERE EXISTS (
          SELECT 1
          FROM veterinarians v
          WHERE v.user_id = $1
            AND v.clinic_id = a.clinic_id
        )
        ORDER BY
          CASE WHEN a.status = 'pending' THEN 0 ELSE 1 END,
          a.created_at DESC
        `,
        [req.user!.id],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get clinic applications error:", error);

      return res.status(500).json({
        message: "دریافت درخواست‌های همکاری کلینیک با خطا مواجه شد.",
      });
    }
  },
);

/**
 * PATCH /api/veterinarian-cooperation/applications/:id/review
 * تأیید یا رد درخواست توسط دامپزشک عضو همان کلینیک
 *
 * Body:
 * { "status": "approved" }
 * یا
 * { "status": "rejected" }
 */
router.patch(
  "/applications/:id/review",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    const applicationId = Number(req.params.id);
    const userId = req.user!.id;
    const { status } = req.body;

    if (
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      return res.status(400).json({
        message: "شناسه درخواست معتبر نیست.",
      });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({
        message: "وضعیت انتخاب‌شده معتبر نیست.",
      });
    }

    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // قفل درخواست تا دو نفر هم‌زمان آن را بررسی نکنند.
      const applicationResult = await client.query(
        `
        SELECT *
        FROM veterinarian_applications
        WHERE id = $1
        FOR UPDATE
        `,
        [applicationId],
      );

      if (applicationResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "درخواست همکاری پیدا نشد.",
        });
      }

      const application = applicationResult.rows[0];

      if (application.status !== "pending") {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "این درخواست قبلاً بررسی شده است.",
        });
      }

      if (!application.clinic_id) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(400).json({
          message: "این درخواست به کلینیک مشخصی متصل نیست.",
        });
      }

      // بررسی دسترسی: دامپزشک باید عضو همان کلینیک باشد.
      const membershipResult = await client.query(
        `
        SELECT id
        FROM veterinarians
        WHERE user_id = $1
          AND clinic_id = $2
        LIMIT 1
        `,
        [userId, application.clinic_id],
      );

      if (membershipResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(403).json({
          message: "شما اجازه بررسی درخواست این کلینیک را ندارید.",
        });
      }

      if (status === "approved") {
        // جلوگیری از ثبت دوباره همین دامپزشک در کلینیک.
        const existingVeterinarian = await client.query(
          `
          SELECT id
          FROM veterinarians
          WHERE clinic_id = $1
            AND license_number = $2
          LIMIT 1
          `,
          [
            application.clinic_id,
            application.license_number,
          ],
        );

        if (existingVeterinarian.rows.length > 0) {
          await client.query("ROLLBACK");
          transactionStarted = false;

          return res.status(409).json({
            message:
              "دامپزشکی با این شماره نظام دامپزشکی قبلاً به این کلینیک اضافه شده است.",
          });
        }

        // دامپزشک متقاضی هنوز حساب ندارد؛ user_id برابر NULL می‌ماند.
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
            application.clinic_id,
            application.specialty,
            application.full_name,
            application.phone,
            application.license_number,
          ],
        );
      }

      const updatedResult = await client.query(
        `
        UPDATE veterinarian_applications
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, applicationId],
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return res.json({
        message:
          status === "approved"
            ? "درخواست تأیید شد و دامپزشک به کلینیک اضافه شد."
            : "درخواست همکاری رد شد.",
        application: updatedResult.rows[0],
      });
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Review veterinarian application error:", error);

      return res.status(500).json({
        message: "بررسی درخواست همکاری با خطا مواجه شد.",
      });
    } finally {
      client.release();
    }
  },
);

/**
 * GET /api/veterinarian-cooperation/my-requests
 * درخواست‌های همکاری ارسال‌شده توسط دامپزشک دارای حساب
 */
router.get(
  "/my-requests",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          r.id,
          r.clinic_id,
          c.name AS clinic_name,
          c.address AS clinic_address,
          r.status,
          r.created_at,
          r.updated_at
        FROM veterinarian_cooperation_requests r
        JOIN clinics c ON c.id = r.clinic_id
        WHERE r.veterinarian_user_id = $1
        ORDER BY r.created_at DESC
        `,
        [req.user!.id],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get veterinarian requests error:", error);

      return res.status(500).json({
        message: "دریافت درخواست‌های همکاری با خطا مواجه شد.",
      });
    }
  },
);

/**
 * POST /api/veterinarian-cooperation/requests
 * ارسال درخواست همکاری توسط دامپزشک دارای حساب برای یک کلینیک
 */
router.post(
  "/requests",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const clinicId = Number(req.body.clinicId);
      const userId = req.user!.id;

      if (!Number.isInteger(clinicId) || clinicId <= 0) {
        return res.status(400).json({
          message: "شناسه کلینیک معتبر نیست.",
        });
      }

      const clinicResult = await pool.query(
        "SELECT id FROM clinics WHERE id = $1",
        [clinicId],
      );

      if (clinicResult.rows.length === 0) {
        return res.status(404).json({
          message: "کلینیک موردنظر پیدا نشد.",
        });
      }

      const existingVeterinarian = await pool.query(
        `
        SELECT id
        FROM veterinarians
        WHERE user_id = $1 AND clinic_id = $2
        `,
        [userId, clinicId],
      );

      if (existingVeterinarian.rows.length > 0) {
        return res.status(409).json({
          message: "شما در حال حاضر عضو این کلینیک هستید.",
        });
      }

      const existingRequest = await pool.query(
        `
        SELECT id, status
        FROM veterinarian_cooperation_requests
        WHERE veterinarian_user_id = $1
          AND clinic_id = $2
        `,
        [userId, clinicId],
      );

      if (existingRequest.rows.length > 0) {
        const request = existingRequest.rows[0];

        return res.status(409).json({
          message:
            request.status === "pending"
              ? "درخواست شما قبلاً ثبت شده و در انتظار بررسی است."
              : request.status === "approved"
                ? "درخواست همکاری شما قبلاً تأیید شده است."
                : "درخواست قبلی شما رد شده است.",
          request,
        });
      }

      const result = await pool.query(
        `
        INSERT INTO veterinarian_cooperation_requests (
          veterinarian_user_id,
          clinic_id
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [userId, clinicId],
      );

      return res.status(201).json({
        message: "درخواست همکاری با موفقیت ثبت شد.",
        request: result.rows[0],
      });
    } catch (error) {
      console.error("Create veterinarian cooperation request error:", error);

      return res.status(500).json({
        message: "ثبت درخواست همکاری با خطا مواجه شد.",
      });
    }
  },
);

export default router;
