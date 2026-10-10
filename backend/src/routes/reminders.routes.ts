import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

// GET USER REMINDERS
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
        reminders.id,
        reminders.pet_id,
        reminders.title,
        reminders.description,
        reminders.reminder_date,
        reminders.type,
        reminders.is_completed,
        reminders.created_at,

        pets.name AS pet_name

      FROM reminders

      JOIN pets
        ON reminders.pet_id = pets.id

      WHERE pets.owner_id = $1

      ORDER BY reminders.reminder_date ASC
      `,
      [userId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get reminders error:", error);

    return res.status(500).json({
      message: "دریافت یادآوری‌ها با خطا مواجه شد.",
    });
  }
});

// GET REMINDER BY ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const reminderId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const result = await pool.query(
      `
  SELECT
    reminders.id,
    reminders.pet_id,
    reminders.title,
    reminders.description,

    TO_CHAR(
      reminders.reminder_date,
      'YYYY-MM-DD'
    ) AS reminder_date,

    reminders.type,
    reminders.is_completed,
    reminders.created_at,

    pets.name AS pet_name

  FROM reminders

  JOIN pets
    ON reminders.pet_id = pets.id

  WHERE pets.owner_id = $1

  ORDER BY reminders.reminder_date ASC
  `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "یادآوری پیدا نشد یا دسترسی ندارید.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get reminder error:", error);

    return res.status(500).json({
      message: "دریافت یادآوری با خطا مواجه شد.",
    });
  }
});

// CREATE REMINDER
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const { pet_id, title, description, reminder_date, type } = req.body;

    if (!pet_id || !title || !reminder_date || !type) {
      return res.status(400).json({
        message: "اطلاعات یادآوری کامل نیست.",
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

    const allowedTypes = [
      "vaccination",
      "medication",
      "appointment",
      "general",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "نوع یادآوری نامعتبر است.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO reminders
      (
        pet_id,
        title,
        description,
        reminder_date,
        type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [pet_id, title, description, reminder_date, type],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create reminder error:", error);

    return res.status(500).json({
      message: "ثبت یادآوری با خطا مواجه شد.",
    });
  }
});

// UPDATE REMINDER STATUS
router.patch(
  "/:id/status",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const reminderId = Number(req.params.id);
      const { is_completed } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: "کاربر احراز هویت نشده است.",
        });
      }

      if (typeof is_completed !== "boolean") {
        return res.status(400).json({
          message: "وضعیت یادآوری نامعتبر است.",
        });
      }

      const reminderCheck = await pool.query(
        `
        SELECT reminders.id
        FROM reminders

        JOIN pets
          ON reminders.pet_id = pets.id

        WHERE reminders.id = $1
          AND pets.owner_id = $2
        `,
        [reminderId, userId],
      );

      if (reminderCheck.rows.length === 0) {
        return res.status(404).json({
          message: "یادآوری پیدا نشد یا دسترسی ندارید.",
        });
      }

      const result = await pool.query(
        `
        UPDATE reminders
        SET is_completed = $1
        WHERE id = $2
        RETURNING *
        `,
        [is_completed, reminderId],
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Update reminder error:", error);

      return res.status(500).json({
        message: "تغییر وضعیت یادآوری با خطا مواجه شد.",
      });
    }
  },
);

// DELETE REMINDER
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const reminderId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const reminderCheck = await pool.query(
      `
      SELECT reminders.id
      FROM reminders

      JOIN pets
        ON reminders.pet_id = pets.id

      WHERE reminders.id = $1
        AND pets.owner_id = $2
      `,
      [reminderId, userId],
    );

    if (reminderCheck.rows.length === 0) {
      return res.status(404).json({
        message: "یادآوری پیدا نشد یا دسترسی ندارید.",
      });
    }

    await pool.query(
      `
      DELETE FROM reminders
      WHERE id = $1
      `,
      [reminderId],
    );

    return res.json({
      message: "یادآوری با موفقیت حذف شد.",
    });
  } catch (error) {
    console.error("Delete reminder error:", error);

    return res.status(500).json({
      message: "حذف یادآوری با خطا مواجه شد.",
    });
  }
});

export default router;
