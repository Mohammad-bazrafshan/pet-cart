import { Router } from "express";
import pool from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}


// ================= REGISTER =================

router.post("/register", async (req, res) => {
  console.log("REGISTER BODY:", req.body);

  try {
    const { name, email, password } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({
        message: "لطفاً تمام فیلدها را تکمیل کنید.",
      });
    }


    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );


    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "این ایمیل قبلاً ثبت شده است.",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'owner')
      RETURNING id, name, email, role
      `,
      [name, email, hashedPassword]
    );


    const newUser = result.rows[0];


    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    return res.status(201).json({
      user: newUser,
      token,
    });


  } catch (error) {

    console.error("Register error:", error);

    return res.status(500).json({
      message: "ثبت‌نام با خطا مواجه شد.",
    });

  }
});



// ================= LOGIN =================

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        message: "ایمیل و گذرواژه الزامی هستند.",
      });
    }



    const result = await pool.query(
      `
      SELECT id, name, email, password, role
      FROM users
      WHERE email = $1
      `,
      [email]
    );



    if (result.rows.length === 0) {

      return res.status(401).json({
        message: "ایمیل یا رمز عبور اشتباه است.",
      });

    }



    const user = result.rows[0];



    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );



    if (!passwordMatch) {

      return res.status(401).json({
        message: "ایمیل یا رمز عبور اشتباه است.",
      });

    }




    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );




    return res.json({

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      token,

    });



  } catch (error) {

    console.error("Login error:", error);


    return res.status(500).json({
      message: "ورود با خطا مواجه شد.",
    });

  }

});



// ================= CURRENT USER =================


router.get(
  "/me",
  authenticateToken,
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
        SELECT id, name, email, role
        FROM users
        WHERE id = $1
        `,
        [userId]
      );



      if (result.rows.length === 0) {

        return res.status(404).json({
          message: "کاربر پیدا نشد.",
        });

      }



      return res.json(result.rows[0]);



    } catch (error) {


      console.error("Get current user error:", error);


      return res.status(500).json({
        message: "دریافت اطلاعات کاربر با خطا مواجه شد.",
      });


    }

  }
);



export default router;