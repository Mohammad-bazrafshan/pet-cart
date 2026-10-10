# 🐾 PetCard — Pet Healthcare Management Platform

**PetCard** is a web-based platform designed to help pet owners manage their pets' health information, keep track of veterinary appointments, and organize important care reminders.

The goal of PetCard is to make pet healthcare management simpler and provide a convenient way for pet owners to connect with veterinary clinics.

## ✨ Features

- 🐶 **Pet Management:** Manage pet profiles and basic information.
- 📋 **Digital Health Records:** Organize pets' medical information and treatment history.
- 🩺 **Veterinary Appointments:** Book and manage veterinary appointments.
- 🔔 **Care Reminders:** Support reminders for important healthcare activities.
- 👨‍⚕️ **Veterinarian Dashboard:** Manage appointments and access relevant patient information.
- 🏥 **Clinic Management:** Organize veterinary clinic information.
- 🔐 **Authentication and Role-Based Access:** Separate access for pet owners, veterinarians, and administrators.

> Features may evolve as development progresses.

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication

### Database
- PostgreSQL

## 📁 Project Structure

```text
PetCard/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── features/
│   ├── pages/
│   ├── services/
│   └── ...
├── backend/
│   └── src/
│       ├── routes/
│       ├── middleware/
│       ├── controllers/
│       └── ...
├── public/
├── package.json
└── README.md
```

*The directory structure may change as the project develops.*

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd PetCard
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Frontend

```bash
npm run dev
```

### 5. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Configure the backend environment variables according to your local PostgreSQL setup and backend configuration.

Make sure the PostgreSQL database is running and the required database and tables have been created.

Start the backend using the development script defined in `backend/package.json`.

## 🔐 User Roles

PetCard is designed around three user roles:

| Role | Responsibilities |
|---|---|
| Pet Owner | Manage pets and appointments |
| Veterinarian | View appointments and relevant patient information |
| Administrator | Manage administrative operations |

Access to features depends on the user's role and permissions.

## 🗺️ Roadmap

- [ ] Improve clinic registration and management
- [ ] Add clinic coordinates and location-based discovery
- [ ] Recommend nearby veterinary clinics
- [ ] Improve appointment availability and scheduling
- [ ] Expand pet health records and reminders
- [ ] Improve responsive design and accessibility

## 🎯 Project Goal

PetCard aims to provide a centralized and user-friendly solution for managing pet healthcare, helping owners stay organized and making veterinary appointment management more convenient.

## 📄 License

No license has been specified yet. Add a license if you intend to distribute or reuse the project under defined terms.

---

**PetCard** — Better care for happier pets. 🐾