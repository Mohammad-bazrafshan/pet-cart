import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth.middleware";
const router = Router();

router.get(
  "/clinic/patients/:petId/records",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const petId = Number(req.params.petId);

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

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
          title,
          description,
          record_type,
          TO_CHAR(record_date, 'YYYY-MM-DD') AS record_date,
          created_at
        FROM medical_records
        WHERE pet_id = $1
        ORDER BY record_date DESC, id DESC
        `,
        [petId],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Get clinic medical records error:", error);

      return res.status(500).json({
        message: "دریافت سوابق پزشکی بیمار با خطا مواجه شد.",
      });
    }
  },
);
// گرفتن سوابق پزشکی یک پت
router.get(
  "/pets/:petId/records",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const petId = Number(req.params.petId);
      const userId = req.user?.id;

      // اول چک کنیم این پت برای همین کاربر است
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
        FROM medical_records
        WHERE pet_id = $1
        ORDER BY record_date DESC
        `,
        [petId],
      );

      return res.json(result.rows);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "دریافت سوابق پزشکی با خطا مواجه شد.",
      });
    }
  },
);

// افزودن سابقه پزشکی
router.post(
  "/pets/:petId/records",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const petId = Number(req.params.petId);
      const userId = req.user?.id;

      const { title, description, record_type, record_date } = req.body;

      // بررسی مالکیت پت
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
        INSERT INTO medical_records
        (
          pet_id,
          title,
          description,
          record_type,
          record_date
        )

        VALUES ($1,$2,$3,$4,$5)

        RETURNING *
        `,
        [petId, title, description, record_type, record_date],
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "ثبت سابقه پزشکی با خطا مواجه شد.",
      });
    }
  },
);

// افزودن سابقه پزشکی توسط دامپزشک
router.get(
  "/clinic/patients/:petId/records",
  authenticateToken,
  requireRole("veterinarian"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const petId = Number(req.params.petId);

      const { title, description, record_type, record_date } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      if (!title || !record_type || !record_date) {
        return res.status(400).json({
          message: "عنوان، نوع سابقه و تاریخ الزامی هستند.",
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
        INSERT INTO medical_records
        (
          pet_id,
          title,
          description,
          record_type,
          record_date
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          pet_id,
          title,
          description,
          record_type,
          TO_CHAR(record_date, 'YYYY-MM-DD') AS record_date,
          created_at
        `,
        [petId, title, description || null, record_type, record_date],
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create clinic medical record error:", error);

      return res.status(500).json({
        message: "ثبت سابقه پزشکی بیمار با خطا مواجه شد.",
      });
    }
  },
);

export default router;
