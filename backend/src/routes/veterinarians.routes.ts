import { Router } from "express";
import pool from "../db";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

// GET ALL VETERINARIANS
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT
        veterinarians.id,
        veterinarians.user_id,
        veterinarians.clinic_id,
        veterinarians.specialty,
        users.name,
        users.email,
        clinics.name AS clinic_name
      FROM veterinarians
      JOIN users
        ON veterinarians.user_id = users.id
      JOIN clinics
        ON veterinarians.clinic_id = clinics.id
      ORDER BY users.name ASC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Get veterinarians error:", error);

    return res.status(500).json({
      message: "دریافت دامپزشکان با خطا مواجه شد.",
    });
  }
});

// GET VETERINARIAN BY ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const veterinarianId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT
        veterinarians.id,
        veterinarians.user_id,
        veterinarians.clinic_id,
        veterinarians.specialty,
        users.name,
        users.email,
        clinics.name AS clinic_name
      FROM veterinarians
      JOIN users
        ON veterinarians.user_id = users.id
      JOIN clinics
        ON veterinarians.clinic_id = clinics.id
      WHERE veterinarians.id = $1
      `,
      [veterinarianId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "دامپزشک پیدا نشد.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get veterinarian error:", error);

    return res.status(500).json({
      message: "دریافت اطلاعات دامپزشک با خطا مواجه شد.",
    });
  }
});

// CREATE VETERINARIAN
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { user_id, clinic_id, specialty } = req.body;

    if (!user_id || !clinic_id) {
      return res.status(400).json({
        message: "کاربر و کلینیک الزامی هستند.",
      });
    }

    // Check user
    const userCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "کاربر پیدا نشد.",
      });
    }

    // Check clinic
    const clinicCheck = await pool.query(
      `
      SELECT id
      FROM clinics
      WHERE id = $1
      `,
      [clinic_id]
    );

    if (clinicCheck.rows.length === 0) {
      return res.status(404).json({
        message: "کلینیک پیدا نشد.",
      });
    }

    // Create veterinarian
    const result = await pool.query(
      `
      INSERT INTO veterinarians
      (
        user_id,
        clinic_id,
        specialty
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [user_id, clinic_id, specialty]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create veterinarian error:", error);

    return res.status(500).json({
      message: "ثبت دامپزشک با خطا مواجه شد.",
    });
  }
});

export default router;