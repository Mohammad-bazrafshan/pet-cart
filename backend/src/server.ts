import express from "express";
import cors from "cors";
import pool from "./db";
import authRouter from "./routes/auth.routes";
import petsRouter from "./routes/pets.routes";
import dotenv from "dotenv";
import medicalRecordRoutes from "./routes/medical-records.routes";
import vaccinationsRouter from "./routes/vaccinations.routes";
import clinicsRouter from "./routes/clinics.route";
import veterinariansRouter from "./routes/veterinarians.routes";
import appointmentsRouter from "./routes/appointments.routes";
import remindersRouter from "./routes/reminders.routes";
import adminRouter from "./routes/admin.routes";
import veterinarianCooperationRoutes from "./routes/veterinarianCooperation.routes";
import providerRoutes from "./routes/provider.routes";
import providerCooperationRoutes from "./routes/provider-cooperation.routes";
dotenv.config();
const app = express();

const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/pets", petsRouter);
app.use("/api", medicalRecordRoutes);
app.use("/api", vaccinationsRouter);
app.use("/api/clinics", clinicsRouter);
app.use("/api/veterinarians", veterinariansRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/veterinarian-cooperation", veterinarianCooperationRoutes);
app.use("/api/reminders", remindersRouter);
app.get("/", (req, res) => {
  res.json({
    message: "PetCard Backend is running!",
  });
});
app.use("/api/admin", adminRouter);
app.use("/api/providers", providerRoutes);
app.use(
  "/api/provider-cooperation-requests",
  providerCooperationRoutes,
);
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
