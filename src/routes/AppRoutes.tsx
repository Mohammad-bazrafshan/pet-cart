import { createBrowserRouter } from "react-router-dom";
import EditPet from "../pages/owner/EditPet";
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import PetProfile from "../pages/owner/PetProfile";
import OwnerLayout from "../layouts/OwnerLayout";
import Dashboard from "../pages/owner/Dashboard";
import Pets from "../pages/owner/Pets";
import Appointments from "../pages/owner/Appointments";
import Reminders from "../pages/owner/Reminders";
import AddPet from "../pages/owner/AddPet";
import ProtectedRoute from "../components/common/ProtectedRoute";
import ClinicLayout from "../layouts/ClinicLayout";
import ClinicDashboard from "../pages/clinic/Dashboard";
import ClinicAppointments from "../pages/clinic/Appointments";
import ClinicPatients from "../pages/clinic/Patients";
import ClinicPatientProfile from "../pages/clinic/PatientProfile";
import RoleProtectedRoute from "../components/common/RoleProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminClinics from "../pages/admin/Clinics";

import AdminClinicDetails from "../pages/admin/ClinicDetails";
import CreateClinic from "../pages/admin/CreateClinic";
import EditClinic from "../pages/admin/EditClinic";
const router = createBrowserRouter([
  {
    element: <RoleProtectedRoute allowedRoles={["veterinarian"]} />,
    children: [
      {
        path: "/clinic",
        element: <ClinicLayout />,
        children: [
          { index: true, element: <ClinicDashboard /> },
          {
            path: "appointments",
            element: <ClinicAppointments />,
          },
          {
            path: "patients",
            element: <ClinicPatients />,
          },
          {
            path: "patients/:id",
            element: <ClinicPatientProfile />,
          },
          
        ],
      },
    ],
  },

  {
    element: <RoleProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <AdminUsers /> },
          { path: "clinics", element: <AdminClinics /> },
          {
            path: "clinics/:id",
            element: <AdminClinicDetails />,
          },
          {
            path: "clinics/new",
            element: <CreateClinic />,
          },
          {
            path: "clinics/:id/edit",
            element: <EditClinic />,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Landing />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <OwnerLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "pets/new", element: <AddPet /> },
          { path: "pets", element: <Pets /> },
          { path: "pets/:id", element: <PetProfile /> },
          { path: "appointments", element: <Appointments /> },
          { path: "reminders", element: <Reminders /> },
          {
            path: "pets/:id/edit",
            element: <EditPet />,
          },
        ],
      },
    ],
  },
]);

export default router;
