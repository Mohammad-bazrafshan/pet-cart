import { Router } from "express";
import pool from "../db";
import bcrypt from "bcrypt";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

// ثبت درخواست همکاری ترینر یا واکر
router.post("/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      email,
      password,
      providerType,
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

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8 ||
      !["trainer", "walker"].includes(providerType)
    ) {
      return res.status(400).json({
        message: "اطلاعات ثبت‌نام معتبر نیست.",
      });
    }

    if (
      !Array.isArray(specialties) ||
      specialties.some((item) => typeof item !== "string")
    ) {
      return res.status(400).json({
        message: "فهرست تخصص‌ها معتبر نیست.",
      });
    }

    if (
      experienceYears !== undefined &&
      (!Number.isInteger(Number(experienceYears)) ||
        Number(experienceYears) < 0)
    ) {
      return res.status(400).json({
        message: "سابقه کاری معتبر نیست.",
      });
    }

    if (
      price !== undefined &&
      price !== null &&
      (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0)
    ) {
      return res.status(400).json({
        message: "قیمت واردشده معتبر نیست.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "این ایمیل قبلاً ثبت شده است.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users (
        name,
        email,
        password,
        role,
        approval_status
      )
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id, name, email, role, approval_status
      `,
      [name.trim(), normalizedEmail, hashedPassword, providerType],
    );

    const user = userResult.rows[0];

    await client.query(
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
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      `,
      [
        user.id,
        providerType,
        phone ?? null,
        province ?? null,
        city ?? null,
        address ?? null,
        bio ?? null,
        experienceYears === undefined ? 0 : Number(experienceYears),
        specialties,
        price === undefined || price === null || price === ""
          ? null
          : Number(price),
        priceUnit ?? null,
      ],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "درخواست همکاری ثبت شد و منتظر تأیید ادمین است.",
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Provider registration error:", error);

    return res.status(500).json({
      message: "ثبت درخواست همکاری با خطا مواجه شد.",
    });
  } finally {
    client.release();
  }
});

/* فهرست عمومی مربی‌ها و پت‌واکرهای تأییدشده */
router.get("/", async (req, res) => {
  const { providerType, city } = req.query;

  if (
    providerType !== undefined &&
    providerType !== "trainer" &&
    providerType !== "walker"
  ) {
    return res.status(400).json({
      message: "نوع ارائه‌دهنده معتبر نیست.",
    });
  }

  if (city !== undefined && typeof city !== "string") {
    return res.status(400).json({
      message: "نام شهر معتبر نیست.",
    });
  }

  try {
    const conditions = [
      "u.approval_status = 'approved'",
      "sp.provider_type IN ('trainer', 'walker')",
    ];

    const params: unknown[] = [];

    if (providerType) {
      params.push(providerType);
      conditions.push(`sp.provider_type = $${params.length}`);
    }

    if (typeof city === "string" && city.trim()) {
      params.push(`%${city.trim()}%`);
      conditions.push(`sp.city ILIKE $${params.length}`);
    }

    const result = await pool.query(
      `
        SELECT
          sp.id,
          u.name,
          sp.provider_type AS "providerType",
          sp.province,
          sp.city,
          sp.bio,
          sp.experience_years AS "experienceYears",
          sp.specialties,
          sp.price,
          sp.price_unit AS "priceUnit"
        FROM service_providers sp
        JOIN users u ON u.id = sp.user_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY u.name ASC
      `,
      params,
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get public providers error:", error);

    return res.status(500).json({
      message: "دریافت فهرست ارائه‌دهندگان با خطا مواجه شد.",
    });
  }
});

// اطلاعات پروفایل ارائه‌دهنده فعلی
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "ابتدا وارد حساب کاربری شوید.",
      });
    }

    if (!["trainer", "walker"].includes(req.user.role)) {
      return res.status(403).json({
        message: "این مسیر مخصوص ترینرها و واکرها است.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          u.id AS user_id,
          u.name,
          u.email,
          u.role,
          u.approval_status,
          sp.phone,
          sp.province,
          sp.city,
          sp.address,
          sp.bio,
          sp.experience_years,
          sp.specialties,
          sp.price,
          sp.price_unit
        FROM users u
        JOIN service_providers sp ON sp.user_id = u.id
        WHERE u.id = $1
        `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "پروفایل ارائه‌دهنده پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get provider profile error:", error);

    return res.status(500).json({
      message: "دریافت پروفایل با خطا مواجه شد.",
    });
  }
});

/* ویرایش پروفایل ترینر یا واکر */
router.put("/me", authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "ابتدا وارد حساب کاربری شوید.",
    });
  }

  if (!["trainer", "walker"].includes(req.user.role)) {
    return res.status(403).json({
      message: "این مسیر مخصوص ترینرها و واکرها است.",
    });
  }

  const {
    name,
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

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      message: "نام و نام خانوادگی الزامی است.",
    });
  }

  if (
    !Array.isArray(specialties) ||
    specialties.some(
      (item: unknown) => typeof item !== "string" || item.trim().length === 0,
    )
  ) {
    return res.status(400).json({
      message: "فهرست تخصص‌ها معتبر نیست.",
    });
  }

  const experience = Number(experienceYears);

  if (!Number.isInteger(experience) || experience < 0) {
    return res.status(400).json({
      message: "سابقه کاری باید عدد صحیح و غیرمنفی باشد.",
    });
  }

  const parsedPrice =
    price === null || price === undefined || price === ""
      ? null
      : Number(price);

  if (
    parsedPrice !== null &&
    (!Number.isFinite(parsedPrice) || parsedPrice < 0)
  ) {
    return res.status(400).json({
      message: "قیمت باید عددی معتبر و غیرمنفی باشد.",
    });
  }

  const optionalFields = [phone, province, city, address, bio, priceUnit];

  if (
    optionalFields.some(
      (value) =>
        value !== undefined && value !== null && typeof value !== "string",
    )
  ) {
    return res.status(400).json({
      message: "یکی از اطلاعات واردشده معتبر نیست.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
        UPDATE users
        SET name = $1
        WHERE id = $2
          AND role = $3
          AND approval_status = 'approved'
        RETURNING id
        `,
      [name.trim(), req.user.id, req.user.role],
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "حساب کاربری تأیید نشده یا معتبر نیست.",
      });
    }

    const providerResult = await client.query(
      `
        UPDATE service_providers
        SET
          phone = $1,
          province = $2,
          city = $3,
          address = $4,
          bio = $5,
          experience_years = $6,
          specialties = $7,
          price = $8,
          price_unit = $9,
          updated_at = NOW()
        WHERE user_id = $10
          AND provider_type = $11
        RETURNING *
        `,
      [
        phone?.trim() || null,
        province?.trim() || null,
        city?.trim() || null,
        address?.trim() || null,
        bio?.trim() || null,
        experience,
        specialties.map((item: string) => item.trim()),
        parsedPrice,
        priceUnit?.trim() || null,
        req.user.id,
        req.user.role,
      ],
    );

    if (providerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "پروفایل ارائه‌دهنده پیدا نشد.",
      });
    }

    await client.query("COMMIT");

    return res.json({
      message: "پروفایل با موفقیت به‌روزرسانی شد.",
      profile: {
        ...providerResult.rows[0],
        name: name.trim(),
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update provider profile error:", error);

    return res.status(500).json({
      message: "ویرایش پروفایل با خطا مواجه شد.",
    });
  } finally {
    client.release();
  }
});

const scheduleDays = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

router.get("/schedule", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        message: "احراز هویت انجام نشده است.",
      });
    }

    if (role !== "trainer" && role !== "walker") {
      return res.status(403).json({
        message: "فقط مربی و پیاده‌گردان به این بخش دسترسی دارند.",
      });
    }

    const providerResult = await pool.query(
      `SELECT id
         FROM service_providers
         WHERE user_id = $1
           AND provider_type = $2`,
      [userId, role],
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({
        message: "پروفایل ارائه‌دهنده خدمات پیدا نشد.",
      });
    }

    const providerId = providerResult.rows[0].id;

    const scheduleResult = await pool.query(
      `SELECT
           day_of_week,
           TO_CHAR(start_time, 'HH24:MI') AS start_time,
           TO_CHAR(end_time, 'HH24:MI') AS end_time,
           is_available
         FROM service_provider_schedules
         WHERE service_provider_id = $1
         ORDER BY day_of_week`,
      [providerId],
    );

    const savedDays = new Map(
      scheduleResult.rows.map((row) => [row.day_of_week, row]),
    );

    const schedule = scheduleDays.map((day, index) => {
      const saved = savedDays.get(index);

      return {
        dayOfWeek: index,
        dayName: day,
        startTime: saved?.start_time ?? "09:00",
        endTime: saved?.end_time ?? "17:00",
        isAvailable: saved?.is_available ?? false,
      };
    });

    return res.json(schedule);
  } catch (error) {
    console.error("Get provider schedule error:", error);

    return res.status(500).json({
      message: "دریافت برنامه کاری با خطا مواجه شد.",
    });
  }
});

router.put("/schedule", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId) {
    return res.status(401).json({
      message: "احراز هویت انجام نشده است.",
    });
  }

  if (role !== "trainer" && role !== "walker") {
    return res.status(403).json({
      message: "فقط مربی و پیاده‌گردان می‌توانند برنامه کاری تنظیم کنند.",
    });
  }

  const { schedule } = req.body;

  if (!Array.isArray(schedule) || schedule.length !== 7) {
    return res.status(400).json({
      message: "برنامه باید شامل هفت روز هفته باشد.",
    });
  }

  const seenDays = new Set<number>();

  for (const day of schedule) {
    if (
      !Number.isInteger(day.dayOfWeek) ||
      day.dayOfWeek < 0 ||
      day.dayOfWeek > 6 ||
      seenDays.has(day.dayOfWeek) ||
      typeof day.isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        message: "اطلاعات روزهای هفته معتبر نیست.",
      });
    }

    seenDays.add(day.dayOfWeek);

    if (!day.isAvailable) continue;

    if (
      typeof day.startTime !== "string" ||
      typeof day.endTime !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.startTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.endTime) ||
      day.startTime >= day.endTime
    ) {
      return res.status(400).json({
        message: `ساعت شروع و پایان روز ${day.dayOfWeek} معتبر نیست.`,
      });
    }
  }

  if (seenDays.size !== 7) {
    return res.status(400).json({
      message: "هر روز هفته باید دقیقاً یک بار ارسال شود.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const providerResult = await client.query(
      `SELECT id
         FROM service_providers
         WHERE user_id = $1
           AND provider_type = $2
         FOR UPDATE`,
      [userId, role],
    );

    if (providerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "پروفایل ارائه‌دهنده خدمات پیدا نشد.",
      });
    }

    const providerId = providerResult.rows[0].id;

    for (const day of schedule) {
      await client.query(
        `INSERT INTO service_provider_schedules (
             service_provider_id,
             day_of_week,
             start_time,
             end_time,
             is_available,
             updated_at
           )
           VALUES (
             $1, $2, $3::time, $4::time, $5, NOW()
           )
           ON CONFLICT (service_provider_id, day_of_week)
           DO UPDATE SET
             start_time = EXCLUDED.start_time,
             end_time = EXCLUDED.end_time,
             is_available = EXCLUDED.is_available,
             updated_at = NOW()`,
        [
          providerId,
          day.dayOfWeek,
          day.isAvailable ? day.startTime : null,
          day.isAvailable ? day.endTime : null,
          day.isAvailable,
        ],
      );
    }

    await client.query("COMMIT");

    return res.json({
      message: "برنامه کاری با موفقیت ذخیره شد.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Save provider schedule error:", error);

    return res.status(500).json({
      message: "ذخیره برنامه کاری با خطا مواجه شد.",
    });
  } finally {
    client.release();
  }
});

router.post("/bookings", authenticateToken, async (req: AuthRequest, res) => {
  const customerId = req.user?.id;
  const role = req.user?.role;

  if (!customerId) {
    return res.status(401).json({
      message: "ابتدا وارد حساب کاربری شوید.",
    });
  }

  if (role !== "owner") {
    return res.status(403).json({
      message: "فقط کاربران عادی می‌توانند رزرو ثبت کنند.",
    });
  }

  const { serviceProviderId, bookingDate, startTime, endTime } = req.body;

  if (
    !Number.isInteger(Number(serviceProviderId)) ||
    Number(serviceProviderId) <= 0 ||
    typeof bookingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
    startTime >= endTime
  ) {
    return res.status(400).json({
      message: "اطلاعات تاریخ یا ساعت رزرو معتبر نیست.",
    });
  }

  const parsedDate = new Date(`${bookingDate}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== bookingDate
  ) {
    return res.status(400).json({
      message: "تاریخ واردشده معتبر نیست.",
    });
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // بررسی ارائه‌دهنده و وضعیت تأیید حساب
    const providerResult = await client.query(
      `
        SELECT sp.id, sp.provider_type
        FROM service_providers sp
        JOIN users u ON u.id = sp.user_id
        WHERE sp.id = $1
          AND sp.provider_type IN ('trainer', 'walker')
          AND u.approval_status = 'approved'
        `,
      [Number(serviceProviderId)],
    );

    if (providerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        message: "ارائه‌دهنده پیدا نشد یا حساب او تأیید نشده است.",
      });
    }

    // بررسی تاریخ رزرو
    const dateResult = await client.query(
      `
        SELECT $1::date >= CURRENT_DATE AS is_valid
        `,
      [bookingDate],
    );

    if (!dateResult.rows[0].is_valid) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "تاریخ رزرو نمی‌تواند در گذشته باشد.",
      });
    }

    // بررسی برنامه هفتگی ارائه‌دهنده
    const scheduleResult = await client.query(
      `
        SELECT 1
        FROM service_provider_schedules
        WHERE service_provider_id = $1
          AND day_of_week =
              EXTRACT(DOW FROM $2::date)::integer
          AND is_available = TRUE
          AND start_time <= $3::time
          AND end_time >= $4::time
        `,
      [Number(serviceProviderId), bookingDate, startTime, endTime],
    );

    if (scheduleResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        message: "این بازه خارج از ساعات کاری ارائه‌دهنده است.",
      });
    }

    // قید دیتابیس از رزروهای هم‌زمان و متداخل جلوگیری می‌کند.
    const bookingResult = await client.query(
      `
        INSERT INTO service_provider_bookings (
          service_provider_id,
          customer_id,
          booking_date,
          start_time,
          end_time,
          status
        )
        VALUES ($1, $2, $3::date, $4::time, $5::time, 'pending')
        RETURNING
          id,
          service_provider_id,
          booking_date,
          start_time,
          end_time,
          status,
          created_at
        `,
      [Number(serviceProviderId), customerId, bookingDate, startTime, endTime],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      message: "درخواست رزرو با موفقیت ثبت شد.",
      booking: bookingResult.rows[0],
    });
  } catch (error: unknown) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    const dbError = error as {
      code?: string;
      constraint?: string;
    };

    if (
      dbError.code === "23P01" &&
      dbError.constraint === "no_overlapping_provider_bookings"
    ) {
      return res.status(409).json({
        message: "این بازه زمانی قبلاً رزرو شده است.",
      });
    }

    console.error("Create provider booking error:", error);

    return res.status(500).json({
      message: "ثبت رزرو با خطا مواجه شد.",
    });
  } finally {
    client.release();
  }
});

// مشاهده رزروهای مشتری یا ارائه‌دهنده خدمات
router.get("/bookings", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId) {
    return res.status(401).json({
      message: "ابتدا وارد حساب کاربری شوید.",
    });
  }

  if (
    typeof role !== "string" ||
    !["owner", "trainer", "walker"].includes(role)
  ) {
    return res.status(403).json({
      message: "شما به این بخش دسترسی ندارید.",
    });
  }

  try {
    let query: string;
    let params: unknown[];

    if (role === "owner") {
      query = `
          SELECT
            b.id,
            b.service_provider_id AS "serviceProviderId",
            b.customer_id AS "customerId",
            b.booking_date AS "bookingDate",
            TO_CHAR(b.start_time, 'HH24:MI') AS "startTime",
            TO_CHAR(b.end_time, 'HH24:MI') AS "endTime",
            b.status,
            b.created_at AS "createdAt",
            sp.provider_type AS "providerType",
            u.name AS "providerName"
          FROM service_provider_bookings b
          JOIN service_providers sp
            ON sp.id = b.service_provider_id
          JOIN users u
            ON u.id = sp.user_id
          WHERE b.customer_id = $1
          ORDER BY b.booking_date DESC, b.start_time DESC
        `;

      params = [userId];
    } else {
      query = `
    SELECT
      b.id,
      b.service_provider_id AS "serviceProviderId",
      b.customer_id AS "customerId",
      b.booking_date AS "bookingDate",
      TO_CHAR(b.start_time, 'HH24:MI') AS "startTime",
      TO_CHAR(b.end_time, 'HH24:MI') AS "endTime",
      b.status,
      b.created_at AS "createdAt",

      sp.provider_type AS "providerType",

      customer.name AS "customerName",
      customer.email AS "customerEmail",
      customer.phone AS "customerPhone",
      customer.province AS "customerProvince",
      customer.city AS "customerCity",
      customer.address AS "customerAddress"

    FROM service_provider_bookings b

    JOIN service_providers sp
      ON sp.id = b.service_provider_id

    JOIN users customer
      ON customer.id = b.customer_id

    WHERE sp.user_id = $1
      AND sp.provider_type = $2

    ORDER BY b.booking_date DESC, b.start_time DESC
  `;

      params = [userId, role];
    }

    const result = await pool.query(query, params);

    return res.json(result.rows);
  } catch (error) {
    console.error("Get provider bookings error:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return res.status(500).json({
      message: "دریافت رزروها با خطا مواجه شد.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// تغییر وضعیت رزرو
router.patch(
  "/bookings/:id/status",
  authenticateToken,
  async (req: AuthRequest, res) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "ابتدا وارد حساب کاربری شوید.",
      });
    }

    if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        message: "شناسه رزرو معتبر نیست.",
      });
    }

    if (
      typeof role !== "string" ||
      !["owner", "trainer", "walker"].includes(role)
    ) {
      return res.status(403).json({
        message: "شما به این بخش دسترسی ندارید.",
      });
    }

    // مشتری فقط اجازه لغو رزرو خودش را دارد.
    if (role === "owner" && status !== "cancelled") {
      return res.status(403).json({
        message: "مشتری فقط می‌تواند رزرو خود را لغو کند.",
      });
    }

    if (
      role !== "owner" &&
      !["confirmed", "cancelled", "completed"].includes(status)
    ) {
      return res.status(400).json({
        message: "وضعیت درخواستی معتبر نیست.",
      });
    }

    if (role !== "owner" && status === "completed") {
      // تکمیل خدمت فقط پس از تأیید رزرو مجاز است.
      // شرط وضعیت در UPDATE این موضوع را کنترل می‌کند.
    }

    try {
      let result;

      if (role === "owner") {
        result = await pool.query(
          `
          UPDATE service_provider_bookings
          SET status = 'cancelled',
              updated_at = NOW()
          WHERE id = $1
            AND customer_id = $2
            AND status IN ('pending', 'confirmed')
          RETURNING id, status
          `,
          [bookingId, userId],
        );
      } else {
        let allowedCurrentStatuses: string[];

        if (status === "confirmed") {
          allowedCurrentStatuses = ["pending"];
        } else if (status === "completed") {
          allowedCurrentStatuses = ["confirmed"];
        } else {
          allowedCurrentStatuses = ["pending", "confirmed"];
        }

        result = await pool.query(
          `
          UPDATE service_provider_bookings b
          SET status = $1,
              updated_at = NOW()
          FROM service_providers sp
          WHERE b.id = $2
            AND b.service_provider_id = sp.id
            AND sp.user_id = $3
            AND sp.provider_type = $4
            AND b.status = ANY($5::varchar[])
          RETURNING b.id, b.status
          `,
          [status, bookingId, userId, role, allowedCurrentStatuses],
        );
      }

      if (result.rows.length === 0) {
        return res.status(409).json({
          message:
            "رزرو پیدا نشد، متعلق به شما نیست یا وضعیت آن قابل تغییر نیست.",
        });
      }

      return res.json({
        message: "وضعیت رزرو با موفقیت تغییر کرد.",
        booking: result.rows[0],
      });
    } catch (error) {
      console.error("Update booking status error:", error);

      return res.status(500).json({
        message: "تغییر وضعیت رزرو با خطا مواجه شد.",
      });
    }
  },
);

router.get(
  "/availability",
  authenticateToken,
  async (req: AuthRequest, res) => {
    const providerId = Number(req.query.providerId);
    const bookingDate = String(req.query.date ?? "");

    if (!Number.isInteger(providerId) || providerId <= 0) {
      return res.status(400).json({
        message: "شناسه مربی یا پت‌واکر معتبر نیست.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
      return res.status(400).json({
        message: "تاریخ معتبر نیست.",
      });
    }

    try {
      const dateResult = await pool.query(
        `SELECT
         $1::date >= CURRENT_DATE AS is_valid,
         EXTRACT(DOW FROM $1::date)::integer AS day_of_week`,
        [bookingDate],
      );

      if (!dateResult.rows[0].is_valid) {
        return res.status(400).json({
          message: "تاریخ نمی‌تواند در گذشته باشد.",
        });
      }

      const providerResult = await pool.query(
        `SELECT id
       FROM service_providers
       WHERE id = $1
         AND provider_type IN ('trainer', 'walker')
       LIMIT 1`,
        [providerId],
      );

      if (providerResult.rowCount === 0) {
        return res.status(404).json({
          message: "ارائه‌دهنده پیدا نشد.",
        });
      }

      const scheduleResult = await pool.query(
        `SELECT start_time, end_time
       FROM service_provider_schedules
       WHERE service_provider_id = $1
         AND day_of_week = $2
         AND is_available = TRUE`,
        [providerId, dateResult.rows[0].day_of_week],
      );

      const bookingsResult = await pool.query(
        `SELECT start_time, end_time
       FROM service_provider_bookings
       WHERE service_provider_id = $1
         AND booking_date = $2::date
         AND status IN ('pending', 'confirmed')`,
        [providerId, bookingDate],
      );

      const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const formatTime = (minutes: number) =>
        `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
          minutes % 60,
        ).padStart(2, "0")}`;

      const occupied = bookingsResult.rows.map((booking) => ({
        start: toMinutes(String(booking.start_time)),
        end: toMinutes(String(booking.end_time)),
      }));

      const slots: { startTime: string; endTime: string }[] = [];

      for (const schedule of scheduleResult.rows) {
        const start = toMinutes(String(schedule.start_time));
        const end = toMinutes(String(schedule.end_time));

        for (let time = start; time + 60 <= end; time += 60) {
          const slotEnd = time + 60;

          const overlaps = occupied.some(
            (booking) => time < booking.end && slotEnd > booking.start,
          );

          if (!overlaps) {
            slots.push({
              startTime: formatTime(time),
              endTime: formatTime(slotEnd),
            });
          }
        }
      }

      return res.json(slots);
    } catch (error) {
      console.error("Get availability error:", error);

      return res.status(500).json({
        message: "دریافت ساعت‌های آزاد با خطا مواجه شد.",
      });
    }
  },
);
// دریافت جزئیات عمومی مربی یا پت‌واکر تأییدشده
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "شناسه ارائه‌دهنده معتبر نیست.",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        sp.id,
        u.name,
        sp.provider_type AS "providerType",
        sp.province,
        sp.city,
        sp.address,
        sp.bio,
        sp.experience_years AS "experienceYears",
        sp.specialties,
        sp.price,
        sp.price_unit AS "priceUnit"
      FROM service_providers sp
      JOIN users u ON u.id = sp.user_id
      WHERE sp.id = $1
        AND u.approval_status = 'approved'
        AND sp.provider_type IN ('trainer', 'walker')
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "ارائه‌دهنده پیدا نشد یا هنوز تأیید نشده است.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get service provider details error:", error);

    return res.status(500).json({
      message: "دریافت جزئیات ارائه‌دهنده با خطا مواجه شد.",
    });
  }
});

export default router;
