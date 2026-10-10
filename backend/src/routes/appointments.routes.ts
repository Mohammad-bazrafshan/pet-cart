import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

// GET USER APPOINTMENTS
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
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
        appointments.id,
        appointments.pet_id,
        appointments.clinic_id,
        appointments.veterinarian_id,
TO_CHAR(
  appointments.appointment_date,
  'YYYY-MM-DD'
) AS appointment_date,        appointments.appointment_time,
        appointments.status,
        appointments.description,
        appointments.created_at,

        pets.name AS pet_name,
        clinics.name AS clinic_name,

        users.name AS veterinarian_name,
        veterinarians.specialty

      FROM appointments

      JOIN pets
        ON appointments.pet_id = pets.id

      JOIN clinics
        ON appointments.clinic_id = clinics.id

      JOIN veterinarians
        ON appointments.veterinarian_id = veterinarians.id

      JOIN users
        ON veterinarians.user_id = users.id

      WHERE pets.owner_id = $1

      ORDER BY
        appointments.appointment_date DESC,
        appointments.appointment_time DESC
      `,
      [userId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      message: "دریافت نوبت‌ها با خطا مواجه شد.",
    });
  }
});
router.get(
  "/clinic",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
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
          appointments.id,
          appointments.pet_id,
          appointments.clinic_id,
          appointments.veterinarian_id,

          TO_CHAR(
            appointments.appointment_date,
            'YYYY-MM-DD'
          ) AS appointment_date,

          appointments.appointment_time,
          appointments.status,
          appointments.description,
          appointments.created_at,

          pets.name AS pet_name,

          clinics.name AS clinic_name,

          users.name AS veterinarian_name,

          veterinarians.specialty

        FROM appointments

        JOIN pets
          ON appointments.pet_id = pets.id

        JOIN clinics
          ON appointments.clinic_id = clinics.id

        JOIN veterinarians
          ON appointments.veterinarian_id = veterinarians.id

        JOIN users
          ON veterinarians.user_id = users.id

        WHERE veterinarians.user_id = $1

        ORDER BY
          appointments.appointment_date ASC,
          appointments.appointment_time ASC
        `,
        [userId],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get clinic appointments error:", error);

      return res.status(500).json({
        message: "دریافت نوبت‌های کلینیک با خطا مواجه شد.",
      });
    }
  },
);

router.get(
  "/clinic/patients",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      const result = await pool.query(
        `
        SELECT DISTINCT
          pets.id,
          pets.name,
          pets.type,
          pets.breed,
          pets.age,
          pets.weight,
          pets.gender,
          users.name AS owner_name,
          users.email AS owner_email
        FROM appointments
        JOIN pets
          ON appointments.pet_id = pets.id
        JOIN users
          ON pets.owner_id = users.id
        JOIN veterinarians
          ON appointments.veterinarian_id = veterinarians.id
        WHERE veterinarians.user_id = $1
        ORDER BY pets.name ASC
        `,
        [userId],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get clinic patients error:", error);

      return res.status(500).json({
        message: "دریافت بیماران کلینیک با خطا مواجه شد.",
      });
    }
  },
);
router.patch(
  "/clinic/:id/status",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const appointmentId = Number(req.params.id);
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      if (status !== "confirmed" && status !== "completed") {
        return res.status(400).json({
          message: "وضعیت نوبت فقط می‌تواند تأیید شده یا تکمیل شده باشد.",
        });
      }

      const appointmentCheck = await pool.query(
        `
        SELECT
          appointments.id,
          appointments.status
        FROM appointments
        JOIN veterinarians
          ON appointments.veterinarian_id = veterinarians.id
        WHERE appointments.id = $1
          AND veterinarians.user_id = $2
        `,
        [appointmentId, userId],
      );

      if (appointmentCheck.rows.length === 0) {
        return res.status(404).json({
          message: "نوبت پیدا نشد یا دسترسی ندارید.",
        });
      }

      const currentStatus = appointmentCheck.rows[0].status;

      if (status === "confirmed" && currentStatus !== "pending") {
        return res.status(400).json({
          message: "فقط نوبت‌های در انتظار تأیید قابل تأیید هستند.",
        });
      }

      if (status === "completed" && currentStatus !== "confirmed") {
        return res.status(400).json({
          message: "فقط نوبت‌های تأیید شده قابل تکمیل هستند.",
        });
      }

      const result = await pool.query(
        `
  UPDATE appointments
  SET status = $1
  WHERE id = $2
    AND veterinarian_id = (
      SELECT id
      FROM veterinarians
      WHERE user_id = $3
    )
  RETURNING *
  `,
        [status, appointmentId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "نوبت پیدا نشد یا دسترسی ندارید.",
        });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Update clinic appointment status error:", error);

      return res.status(500).json({
        message: "تغییر وضعیت نوبت با خطا مواجه شد.",
      });
    }
  },
);
router.get(
  "/clinic/patients/:id",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const petId = Number(req.params.id);

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      const result = await pool.query(
        `
        SELECT DISTINCT
          pets.id,
          pets.name,
          pets.type,
          pets.breed,
          pets.age,
          pets.weight,
          pets.gender,
          users.name AS owner_name,
          users.email AS owner_email
        FROM pets
        JOIN users
          ON pets.owner_id = users.id
        JOIN appointments
          ON appointments.pet_id = pets.id
        JOIN veterinarians
          ON appointments.veterinarian_id = veterinarians.id
        WHERE pets.id = $1
          AND veterinarians.user_id = $2
        `,
        [petId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "بیمار پیدا نشد یا دسترسی ندارید.",
        });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Get clinic patient error:", error);

      return res.status(500).json({
        message: "دریافت پرونده بیمار با خطا مواجه شد.",
      });
    }
  },
);

/**
 * GET OCCUPIED APPOINTMENT TIMES
 * دریافت ساعت‌های رزروشده یک دامپزشک در یک تاریخ
 */
router.get(
  "/availability",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const veterinarianId = Number(req.query.veterinarian_id);
      const appointmentDate = String(req.query.date ?? "");

      if (
        !Number.isInteger(veterinarianId) ||
        veterinarianId <= 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
      ) {
        return res.status(400).json({
          message: "شناسه دامپزشک یا تاریخ معتبر نیست.",
        });
      }

      const result = await pool.query(
        `
          SELECT TO_CHAR(appointment_time, 'HH24:MI') AS time
          FROM appointments
          WHERE veterinarian_id = $1
            AND appointment_date = $2::date
            AND status IN ('pending', 'confirmed')
          ORDER BY appointment_time ASC
        `,
        [veterinarianId, appointmentDate],
      );

      return res.json({
        veterinarian_id: veterinarianId,
        date: appointmentDate,
        occupied_times: result.rows.map((row) => row.time),
      });
    } catch (error) {
      console.error("Get appointment availability error:", error);

      return res.status(500).json({
        message: "دریافت ساعت‌های نوبت با خطا مواجه شد.",
      });
    }
  },
);

// GET APPOINTMENT BY ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const appointmentId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        appointments.id,
        appointments.pet_id,
        appointments.clinic_id,
        appointments.veterinarian_id,
TO_CHAR(
  appointments.appointment_date,
  'YYYY-MM-DD'
) AS appointment_date,        appointments.appointment_time,
        appointments.status,
        appointments.description,
        appointments.created_at,

        pets.name AS pet_name,
        clinics.name AS clinic_name,

        users.name AS veterinarian_name,
        veterinarians.specialty

      FROM appointments

      JOIN pets
        ON appointments.pet_id = pets.id

      JOIN clinics
        ON appointments.clinic_id = clinics.id

      JOIN veterinarians
        ON appointments.veterinarian_id = veterinarians.id

      JOIN users
        ON veterinarians.user_id = users.id

      WHERE appointments.id = $1
        AND pets.owner_id = $2
      `,
      [appointmentId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "نوبت پیدا نشد یا دسترسی ندارید.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get appointment error:", error);

    return res.status(500).json({
      message: "دریافت نوبت با خطا مواجه شد.",
    });
  }
});

// CREATE APPOINTMENT

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const {
      pet_id,
      clinic_id,
      veterinarian_id,
      appointment_date,
      appointment_time,
      description,
    } = req.body;

    // Validate required fields
    if (
      !pet_id ||
      !clinic_id ||
      !veterinarian_id ||
      !appointment_date ||
      !appointment_time
    ) {
      return res.status(400).json({
        message: "اطلاعات نوبت کامل نیست.",
      });
    }

    // Check pet ownership
    const petCheck = await pool.query(
      `
      SELECT id
      FROM pets
      WHERE id = $1
        AND owner_id = $2
      `,
      [pet_id, userId],
    );

    if (petCheck.rows.length === 0) {
      return res.status(404).json({
        message: "حیوان پیدا نشد یا دسترسی ندارید.",
      });
    }

    // Check clinic
    const clinicCheck = await pool.query(
      `
      SELECT id
      FROM clinics
      WHERE id = $1
      `,
      [clinic_id],
    );

    if (clinicCheck.rows.length === 0) {
      return res.status(404).json({
        message: "کلینیک پیدا نشد.",
      });
    }

    // Check veterinarian and clinic relationship
    const veterinarianCheck = await pool.query(
      `
      SELECT id
      FROM veterinarians
      WHERE id = $1
        AND clinic_id = $2
      `,
      [veterinarian_id, clinic_id],
    );

    if (veterinarianCheck.rows.length === 0) {
      return res.status(404).json({
        message: "دامپزشک پیدا نشد یا متعلق به این کلینیک نیست.",
      });
    }

    // Create appointment
    try {
      const result = await pool.query(
        `
        INSERT INTO appointments (
          pet_id,
          clinic_id,
          veterinarian_id,
          appointment_date,
          appointment_time,
          status,
          description
        )
        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
        RETURNING *
        `,
        [
          pet_id,
          clinic_id,
          veterinarian_id,
          appointment_date,
          appointment_time,
          description ?? null,
        ],
      );

      return res.status(201).json({
        message: "درخواست نوبت با موفقیت ثبت شد.",
        appointment: result.rows[0],
      });
    } catch (error: unknown) {
      const dbError = error as {
        code?: string;
        constraint?: string;
      };

      // Handle duplicate active appointment time
      if (
        dbError.code === "23505" &&
        dbError.constraint === "unique_active_veterinarian_appointment"
      ) {
        return res.status(409).json({
          message: "این ساعت قبلاً رزرو شده است. لطفاً ساعت دیگری انتخاب کنید.",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      message: "ثبت نوبت با خطا مواجه شد.",
    });
  }
});

// UPDATE APPOINTMENT STATUS
// UPDATE APPOINTMENT STATUS
router.patch(
  "/:id/status",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const appointmentId = Number(req.params.id);
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      // صاحب حیوان فقط اجازه لغو نوبت را دارد
      if (status !== "cancelled") {
        return res.status(403).json({
          message: "شما فقط می‌توانید نوبت را لغو کنید.",
        });
      }

      const appointmentCheck = await pool.query(
        `
        SELECT appointments.id, appointments.status
        FROM appointments

        JOIN pets
          ON appointments.pet_id = pets.id

        WHERE appointments.id = $1
          AND pets.owner_id = $2
        `,
        [appointmentId, userId],
      );

      if (appointmentCheck.rows.length === 0) {
        return res.status(404).json({
          message: "نوبت پیدا نشد یا دسترسی ندارید.",
        });
      }

      const currentStatus = appointmentCheck.rows[0].status;

      // نوبت انجام‌شده یا قبلاً لغوشده را نمی‌توان لغو کرد
      if (currentStatus === "completed" || currentStatus === "cancelled") {
        return res.status(400).json({
          message: "این نوبت قابل لغو نیست.",
        });
      }

      const result = await pool.query(
        `
        UPDATE appointments
        SET status = 'cancelled'
        WHERE id = $1
        RETURNING *
        `,
        [appointmentId],
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Cancel appointment error:", error);

      return res.status(500).json({
        message: "لغو نوبت با خطا مواجه شد.",
      });
    }
  },
);

export default router;
