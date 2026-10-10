import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";
const router = Router();
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const result = await pool.query(
      `SELECT *
         FROM pets
         WHERE owner_id = $1
         ORDER BY id DESC`,
      [ownerId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get pets error:", error);

    return res.status(500).json({
      message: "دریافت حیوانات با خطا مواجه شد.",
    });
  }
});
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const { name, type, breed, age, weight, gender } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "نام و نوع حیوان الزامی است.",
      });
    }

    const result = await pool.query(
      `INSERT INTO pets
        (owner_id, name, type, breed, age, weight, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
      [ownerId, name, type, breed, age, weight, gender],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create pet error:", error);

    return res.status(500).json({
      message: "Failed to create pet",
    });
  }
});
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const petId = Number(req.params.id);
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    if (Number.isNaN(petId)) {
      return res.status(400).json({
        message: "شناسه حیوان نامعتبر است.",
      });
    }

    const result = await pool.query(
      `SELECT *
         FROM pets
         WHERE id = $1 AND owner_id = $2`,
      [petId, ownerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "حیوان پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get pet error:", error);

    return res.status(500).json({
      message: "دریافت اطلاعات حیوان با خطا مواجه شد.",
    });
  }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const petId = Number(req.params.id);
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    if (Number.isNaN(petId)) {
      return res.status(400).json({
        message: "شناسه حیوان نامعتبر است.",
      });
    }

    const result = await pool.query(
      `DELETE FROM pets
         WHERE id = $1
           AND owner_id = $2
         RETURNING *`,
      [petId, ownerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "حیوان پیدا نشد.",
      });
    }

    return res.json({
      message: "حیوان با موفقیت حذف شد.",
      pet: result.rows[0],
    });
  } catch (error) {
    console.error("Delete pet error:", error);

    return res.status(500).json({
      message: "حذف حیوان با خطا مواجه شد.",
    });
  }
});
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const petId = Number(req.params.id);
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        message: "کاربر احراز هویت نشده است.",
      });
    }

    if (Number.isNaN(petId)) {
      return res.status(400).json({
        message: "شناسه حیوان نامعتبر است.",
      });
    }

    const { name, type, breed, age, weight, gender } = req.body;

    const result = await pool.query(
      `UPDATE pets
         SET
           name = $1,
           type = $2,
           breed = $3,
           age = $4,
           weight = $5,
           gender = $6
         WHERE id = $7
           AND owner_id = $8
         RETURNING *`,
      [name, type, breed, age, weight, gender, petId, ownerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "حیوان پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update pet error:", error);

    return res.status(500).json({
      message: "ویرایش حیوان با خطا مواجه شد.",
    });
  }
});
export default router;
