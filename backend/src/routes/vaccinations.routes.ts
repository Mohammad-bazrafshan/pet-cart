import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";
const router = Router();
// مشاهده واکسیناسیون‌های یک بیمار توسط دامپزشک
router.get(
  "/clinic/patients/:petId/vaccinations",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const petId = Number(req.params.petId);

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      // بررسی اینکه این پت بیمار همین دامپزشک است
      const patientCheck = await pool.query(
        `
        SELECT pets.id
        FROM pets
        JOIN appointments
          ON appointments.pet_id = pets.id
        JOIN veterinarians
          ON appointments.veterinarian_id = veterinarians.id
        WHERE pets.id = $1
          AND veterinarians.user_id = $2
        LIMIT 1
        `,
        [petId, userId],
      );

      if (patientCheck.rows.length === 0) {
        return res.status(404).json({
          message: "بیمار پیدا نشد یا دسترسی ندارید.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          pet_id,
          vaccine_name,
          TO_CHAR(
            vaccination_date,
            'YYYY-MM-DD'
          ) AS vaccination_date,
          TO_CHAR(
            next_due_date,
            'YYYY-MM-DD'
          ) AS next_due_date,
          description,
          created_at
        FROM vaccinations
        WHERE pet_id = $1
        ORDER BY vaccination_date DESC, id DESC
        `,
        [petId],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get clinic vaccinations error:", error);

      return res.status(500).json({
        message: "دریافت واکسیناسیون‌های بیمار با خطا مواجه شد.",
      });
    }
  },
);

// ثبت واکسیناسیون توسط دامپزشک
router.post(
  "/clinic/patients/:petId/vaccinations",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const petId = Number(req.params.petId);

      const { vaccine_name, vaccination_date, next_due_date, description } =
        req.body;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      if (!vaccine_name || !vaccination_date) {
        return res.status(400).json({
          message: "نام واکسن و تاریخ تزریق الزامی هستند.",
        });
      }

      // بررسی دسترسی دامپزشک به بیمار
      const patientCheck = await pool.query(
        `
        SELECT pets.id
        FROM pets
        JOIN appointments
          ON appointments.pet_id = pets.id
        JOIN veterinarians
          ON appointments.veterinarian_id = veterinarians.id
        WHERE pets.id = $1
          AND veterinarians.user_id = $2
        LIMIT 1
        `,
        [petId, userId],
      );

      if (patientCheck.rows.length === 0) {
        return res.status(404).json({
          message: "بیمار پیدا نشد یا دسترسی ندارید.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO vaccinations
        (
          pet_id,
          vaccine_name,
          vaccination_date,
          next_due_date,
          description
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          pet_id,
          vaccine_name,
          TO_CHAR(
            vaccination_date,
            'YYYY-MM-DD'
          ) AS vaccination_date,
          TO_CHAR(
            next_due_date,
            'YYYY-MM-DD'
          ) AS next_due_date,
          description,
          created_at
        `,
        [
          petId,
          vaccine_name,
          vaccination_date,
          next_due_date || null,
          description || null,
        ],
      );
      if (next_due_date) {
        const existingReminder = await pool.query(
          `
    SELECT id
    FROM reminders
    WHERE pet_id = $1
      AND type = 'vaccination'
      AND reminder_date = $2
      AND title = $3
    LIMIT 1
    `,
          [petId, next_due_date, `یادآوری واکسن ${vaccine_name}`],
        );

        if (existingReminder.rows.length === 0) {
          await pool.query(
            `
      INSERT INTO reminders
      (
        pet_id,
        title,
        description,
        reminder_date,
        type
      )
      VALUES ($1, $2, $3, $4, 'vaccination')
      `,
            [
              petId,
              `یادآوری واکسن ${vaccine_name}`,
              `زمان واکسیناسیون بعدی ${vaccine_name} فرا رسیده است.`,
              next_due_date,
            ],
          );
        }
      }

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create clinic vaccination error:", error);

      return res.status(500).json({
        message: "ثبت واکسیناسیون بیمار با خطا مواجه شد.",
      });
    }
  },
);
// دریافت واکسن‌های یک حیوان
router.get(
  "/pets/:petId/vaccinations",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const petId = Number(req.params.petId);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      const petCheck = await pool.query(
        `
        SELECT id
        FROM pets
        WHERE id = $1 AND owner_id = $2
        `,
        [petId, userId],
      );

      if (petCheck.rows.length === 0) {
        return res.status(404).json({
          message: "حیوان پیدا نشد یا دسترسی ندارید.",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM vaccinations
        WHERE pet_id = $1
        ORDER BY vaccination_date DESC
        `,
        [petId],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get vaccinations error:", error);

      return res.status(500).json({
        message: "دریافت واکسن‌ها با خطا مواجه شد.",
      });
    }
  },
);

// ثبت واکسن جدید
router.post(
  "/pets/:petId/vaccinations",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const petId = Number(req.params.petId);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      const { vaccine_name, vaccination_date, next_due_date, description } =
        req.body;

      if (!vaccine_name || !vaccination_date) {
        return res.status(400).json({
          message: "نام واکسن و تاریخ تزریق الزامی هستند.",
        });
      }

      const petCheck = await pool.query(
        `
        SELECT id
        FROM pets
        WHERE id = $1 AND owner_id = $2
        `,
        [petId, userId],
      );

      if (petCheck.rows.length === 0) {
        return res.status(404).json({
          message: "حیوان پیدا نشد یا دسترسی ندارید.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO vaccinations
        (
          pet_id,
          vaccine_name,
          vaccination_date,
          next_due_date,
          description
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [petId, vaccine_name, vaccination_date, next_due_date, description],
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create vaccination error:", error);

      return res.status(500).json({
        message: "ثبت واکسن با خطا مواجه شد.",
      });
    }
  },
);

export default router;
