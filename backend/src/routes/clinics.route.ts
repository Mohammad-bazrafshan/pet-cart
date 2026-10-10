import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

/**
 * POST /api/clinics/cooperation-requests
 * ثبت درخواست همکاری کلینیک
 */
router.post("/cooperation-requests", async (req, res) => {
  try {
    const {
      clinicName,
      managerName,
      phone,
      city,
      description,
    } = req.body;

    if (
      typeof clinicName !== "string" ||
      !clinicName.trim() ||
      typeof managerName !== "string" ||
      !managerName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof city !== "string" ||
      !city.trim()
    ) {
      return res.status(400).json({
        message: "نام کلینیک، نام مسئول، شماره تماس و شهر الزامی هستند.",
      });
    }

    if (
      clinicName.trim().length > 150 ||
      managerName.trim().length > 150 ||
      phone.trim().length > 30 ||
      city.trim().length > 100 ||
      (typeof description === "string" &&
        description.trim().length > 2000)
    ) {
      return res.status(400).json({
        message: "طول یکی از فیلدهای واردشده بیش از حد مجاز است.",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "فرمت توضیحات معتبر نیست.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO clinic_cooperation_requests (
        clinic_name,
        manager_name,
        phone,
        city,
        description,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING
        id,
        clinic_name,
        manager_name,
        phone,
        city,
        description,
        status,
        created_at
      `,
      [
        clinicName.trim(),
        managerName.trim(),
        phone.trim(),
        city.trim(),
        description?.trim() || null,
      ]
    );

    return res.status(201).json({
      message: "درخواست همکاری با موفقیت ثبت شد.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create clinic cooperation request error:", error);

    return res.status(500).json({
      message: "ثبت درخواست همکاری با خطا مواجه شد.",
    });
  }
});

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