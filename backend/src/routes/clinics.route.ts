import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

// GET ALL CLINICS
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM clinics
      ORDER BY name ASC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Get clinics error:", error);

    return res.status(500).json({
      message: "دریافت کلینیک‌ها با خطا مواجه شد.",
    });
  }
});

// GET CLINIC BY ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const clinicId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT *
      FROM clinics
      WHERE id = $1
      `,
      [clinicId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "کلینیک پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get clinic error:", error);

    return res.status(500).json({
      message: "دریافت اطلاعات کلینیک با خطا مواجه شد.",
    });
  }
});

// CREATE CLINIC
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, phone, address, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "نام کلینیک الزامی است.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO clinics
      (
        name,
        phone,
        address,
        description
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, phone, address, description]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create clinic error:", error);

    return res.status(500).json({
      message: "ثبت کلینیک با خطا مواجه شد.",
    });
  }
});

export default router;