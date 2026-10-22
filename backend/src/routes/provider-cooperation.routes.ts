import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

/* ثبت درخواست همکاری ترینر یا واکر */
router.post("/", async (req, res) => {
  try {
    const {
      providerType,
      fullName,
      email,
      password,
      phone,
      province,
      city,
      address,
      bio,
      experienceYears,
      specialties,
      price,
      priceUnit,
    } = req.body;

    if (!["trainer", "walker"].includes(providerType)) {
      return res.status(400).json({
        message: "نوع همکاری باید ترینر یا واکر باشد.",
      });
    }

    const requiredFields = [
      fullName,
      email,
      password,
      phone,
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

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      normalizedEmail.length > 254
    ) {
      return res.status(400).json({
        message: "ایمیل معتبر وارد کنید.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد.",
      });
    }

    const textFields = [
      { value: fullName, max: 150 },
      { value: phone, max: 30 },
      { value: province, max: 100 },
      { value: city, max: 100 },
      { value: address, max: 500 },
      { value: bio, max: 2000 },
      { value: priceUnit, max: 30 },
    ];

    if (
      textFields.some(
        ({ value, max }) =>
          value != null &&
          (typeof value !== "string" || value.trim().length > max),
      )
    ) {
      return res.status(400).json({
        message: "یکی از فیلدها طول نامعتبر دارد.",
      });
    }

    const parsedExperience = Number(experienceYears ?? 0);

    if (
      !Number.isInteger(parsedExperience) ||
      parsedExperience < 0 ||
      parsedExperience > 80
    ) {
      return res.status(400).json({
        message: "سابقه کاری باید عدد صحیح بین صفر تا ۸۰ باشد.",
      });
    }

    const parsedPrice =
      price === undefined || price === null || price === ""
        ? null
        : Number(price);

    if (
      parsedPrice !== null &&
      (!Number.isFinite(parsedPrice) || parsedPrice < 0)
    ) {
      return res.status(400).json({
        message: "مبلغ پیشنهادی معتبر نیست.",
      });
    }

    const normalizedSpecialties =
      specialties === undefined ? [] : specialties;

    if (
      !Array.isArray(normalizedSpecialties) ||
      !normalizedSpecialties.every(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0 &&
          item.trim().length <= 100,
      ) ||
      normalizedSpecialties.length > 20
    ) {
      return res.status(400).json({
        message: "فهرست تخصص‌ها معتبر نیست.",
      });
    }

    const existing = await pool.query(
      `
      SELECT email
      FROM users
      WHERE LOWER(email) = $1

      UNION ALL

      SELECT email
      FROM provider_cooperation_requests
      WHERE LOWER(email) = $1

      LIMIT 1
      `,
      [normalizedEmail],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message:
          "با این ایمیل قبلاً حساب کاربری یا درخواست همکاری ثبت شده است.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO provider_cooperation_requests (
        provider_type,
        full_name,
        email,
        password_hash,
        phone,
        province,
        city,
        address,
        bio,
        experience_years,
        specialties,
        price,
        price_unit
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING
        id, provider_type, full_name, email,
        status, created_at
      `,
      [
        providerType,
        fullName.trim(),
        normalizedEmail,
        passwordHash,
        phone.trim(),
        province.trim(),
        city.trim(),
        address?.trim() || null,
        bio?.trim() || null,
        parsedExperience,
        normalizedSpecialties.map((item: string) => item.trim()),
        parsedPrice,
        priceUnit?.trim() || null,
      ],
    );

    return res.status(201).json({
      message:
        "درخواست همکاری ثبت شد و پس از بررسی ادمین نتیجه مشخص می‌شود.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create provider cooperation request error:", error);

    return res.status(500).json({
      message: "ثبت درخواست همکاری با خطا مواجه شد.",
    });
  }
});

/* مشاهده درخواست‌های همکاری توسط ادمین */
router.get(
  "/",
  authenticateToken,
  requireRole("admin"),
  async (_req: AuthRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          provider_type,
          full_name,
          email,
          phone,
          province,
          city,
          address,
          bio,
          experience_years,
          specialties,
          price,
          price_unit,
          status,
          created_at,
          reviewed_at
        FROM provider_cooperation_requests
        ORDER BY
          CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
          created_at DESC
      `);

      return res.json(result.rows);
    } catch (error) {
      console.error("Get provider cooperation requests error:", error);

      return res.status(500).json({
        message: "دریافت درخواست‌های همکاری ناموفق بود.",
      });
    }
  },
);

/* تأیید یا رد درخواست توسط ادمین */
router.patch(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    const requestId = Number(req.params.id);
    const status: unknown = req.body?.status;

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        message: "شناسه درخواست معتبر نیست.",
      });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({
        message: "وضعیت باید approved یا rejected باشد.",
      });
    }

    let client: Awaited<ReturnType<typeof pool.connect>> | undefined;
    let transactionStarted = false;

    try {
      client = await pool.connect();
      await client.query("BEGIN");
      transactionStarted = true;

      const requestResult = await client.query(
        `
        SELECT *
        FROM provider_cooperation_requests
        WHERE id = $1
        FOR UPDATE
        `,
        [requestId],
      );

      if (requestResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "درخواست پیدا نشد.",
        });
      }

      const request = requestResult.rows[0];

      if (request.status !== "pending") {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "این درخواست قبلاً بررسی شده است.",
        });
      }

      let createdUser = null;
      let createdProvider = null;

      if (status === "approved") {
        const existingUser = await client.query(
          `SELECT id FROM users WHERE LOWER(email) = $1`,
          [request.email.toLowerCase()],
        );

        if (existingUser.rows.length > 0) {
          await client.query("ROLLBACK");
          transactionStarted = false;

          return res.status(409).json({
            message: "این ایمیل قبلاً برای حساب دیگری استفاده شده است.",
          });
        }

        const userResult = await client.query(
          `
          INSERT INTO users (name, email, password, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, email, role, created_at
          `,
          [
            request.full_name,
            request.email,
            request.password_hash,
            request.provider_type,
          ],
        );

        createdUser = userResult.rows[0];

        const providerResult = await client.query(
          `
          INSERT INTO service_providers (
            user_id,
            provider_type,
            phone,
            province,
            city,
            address,
            bio,
            experience_years,
            specialties,
            price,
            price_unit
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
          `,
          [
            createdUser.id,
            request.provider_type,
            request.phone,
            request.province,
            request.city,
            request.address,
            request.bio,
            request.experience_years,
            request.specialties,
            request.price,
            request.price_unit,
          ],
        );

        createdProvider = providerResult.rows[0];
      }

      const updatedRequest = await client.query(
        `
        UPDATE provider_cooperation_requests
        SET status = $1, reviewed_at = NOW()
        WHERE id = $2
        RETURNING
          id, provider_type, full_name, email, status, reviewed_at
        `,
        [status, requestId],
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return res.json({
        message:
          status === "approved"
            ? "درخواست تأیید شد و حساب کاربری ساخته شد."
            : "درخواست همکاری رد شد.",
        request: updatedRequest.rows[0],
        user: createdUser,
        provider: createdProvider,
      });
    } catch (error) {
      if (transactionStarted && client) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Review provider cooperation request error:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        return res.status(409).json({
          message: "ایمیل یا اطلاعات یکتا قبلاً ثبت شده است.",
        });
      }

      return res.status(500).json({
        message: "بررسی درخواست همکاری با خطا مواجه شد.",
      });
    } finally {
      client?.release();
    }
  },
);

export default router;