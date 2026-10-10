-- =====================================================
-- PetCard Database
-- PostgreSQL
-- =====================================================


-- =====================================================
-- 0. DELETE EXISTING TABLES
-- =====================================================

DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS veterinarians CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS vaccinations CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 2. PETS
-- =====================================================

CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age INTEGER,
    weight DECIMAL(5,2),
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pet_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 3. MEDICAL RECORDS
-- =====================================================

CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    record_type VARCHAR(50) NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_medical_record_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 4. VACCINATIONS
-- =====================================================

CREATE TABLE vaccinations (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vaccination_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 5. CLINICS
-- =====================================================

CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 6. VETERINARIANS
-- =====================================================

CREATE TABLE veterinarians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    clinic_id INTEGER NOT NULL,
    specialty VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_veterinarian_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_veterinarian_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 7. APPOINTMENTS
-- =====================================================

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,

    pet_id INTEGER NOT NULL,
    clinic_id INTEGER NOT NULL,
    veterinarian_id INTEGER NOT NULL,

    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_veterinarian
        FOREIGN KEY (veterinarian_id)
        REFERENCES veterinarians(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 8. REMINDERS
-- =====================================================

CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,

    pet_id INTEGER NOT NULL,

    title VARCHAR(150) NOT NULL,
    description TEXT,

    reminder_date DATE NOT NULL,

    type VARCHAR(30) NOT NULL,

    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reminder_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
);


-- =====================================================
-- CHECK ALL TABLES
-- =====================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name


-- =====================================================
-- TEST DATA FOR PETCARD
-- =====================================================


-- =====================================================
-- 1. TEST VETERINARIAN USER
-- =====================================================

INSERT INTO users (
    name,
    email,
    password,
    role
)
VALUES (
    'دکتر علی رضایی',
    'vet.test@petcard.com',
    'test-password',
    'veterinarian'
)
RETURNING id, name, email, role;


-- =====================================================
-- 2. TEST CLINIC
-- =====================================================

INSERT INTO clinics (
    name,
    phone,
    address,
    description
)
VALUES (
    'کلینیک دامپزشکی پت‌کارت',
    '02112345678',
    'تهران، خیابان ولیعصر',
    'کلینیک آزمایشی برای تست سیستم PetCard'
)
RETURNING *;


-- =====================================================
-- 3. CONNECT VETERINARIAN TO CLINIC
-- =====================================================

INSERT INTO veterinarians (
    user_id,
    clinic_id,
    specialty
)
VALUES (
    (
        SELECT id
        FROM users
        WHERE email = 'vet.test@petcard.com'
    ),
    (
        SELECT id
        FROM clinics
        WHERE name = 'کلینیک دامپزشکی پت‌کارت'
    ),
    'حیوانات خانگی'
)
RETURNING *;


-- =====================================================
-- 4. CHECK TEST DATA
-- =====================================================

SELECT
    veterinarians.id,
    users.name AS veterinarian_name,
    users.email,
	users.password,
    clinics.name AS clinic_name,
    veterinarians.specialty
FROM veterinarians
JOIN users
    ON veterinarians.user_id = users.id
JOIN clinics
    ON veterinarians.clinic_id = clinics.id;

SELECT id, name, owner_id
FROM pets
ORDER BY id;






SELECT
    clinics.id AS clinic_id,
    clinics.name AS clinic_name,
    veterinarians.id AS veterinarian_id,
    users.name AS veterinarian_name
FROM veterinarians
JOIN users
    ON veterinarians.user_id = users.id
JOIN clinics
    ON veterinarians.clinic_id = clinics.id;



INSERT INTO appointments (
    pet_id,
    clinic_id,
    veterinarian_id,
    appointment_date,
    appointment_time,
    status,
    description
)
VALUES (
    11,
    1,
    1,
    '2026-10-15',
    '10:30',
    'pending',
    'معاینه دوره‌ای'
)
RETURNING *;


SELECT
    appointments.id,
    pets.name AS pet_name,
    clinics.name AS clinic_name,
    users.name AS veterinarian_name,
    veterinarians.specialty,
    appointments.appointment_date,
    appointments.appointment_time,
    appointments.status,
    appointments.description
FROM appointments
JOIN pets
    ON appointments.pet_id = pets.id
JOIN clinics
    ON appointments.clinic_id = clinics.id
JOIN veterinarians
    ON appointments.veterinarian_id = veterinarians.id
JOIN users
    ON veterinarians.user_id = users.id
ORDER BY appointments.id DESC;


SELECT
    id,
    pet_id,
    clinic_id,
    veterinarian_id,
    appointment_date,
    appointment_time,
    status,
    description
FROM appointments
ORDER BY id DESC;


UPDATE users
SET password = '$2b$10$2whyv56mRCaJUCKBDR1SiOcRslyp4znteSSXhLRHFUZc7N3PXsfaS'
WHERE email = 'vet.test@petcard.com';



UPDATE users
SET role = 'admin'
WHERE email = 'kosar@gmail.com';

SELECT id, name, email, role
FROM users;

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;	


SELECT *
FROM appointments
LIMIT 5;	


SELECT status, COUNT(*) AS total
FROM appointments
GROUP BY status
ORDER BY status;


SELECT
    id,
    pet_id,
    clinic_id,
    veterinarian_id,
    appointment_date,
    appointment_time,
    status
FROM appointments
ORDER BY appointment_date, appointment_time
LIMIT 20;

SELECT
    veterinarian_id,
    appointment_date,
    appointment_time,
    COUNT(*) AS total
FROM appointments
WHERE status IN ('pending', 'confirmed')
GROUP BY
    veterinarian_id,
    appointment_date,
    appointment_time
HAVING COUNT(*) > 1;


CREATE UNIQUE INDEX unique_active_veterinarian_appointment
ON appointments (
    veterinarian_id,
    appointment_date,
    appointment_time
)
WHERE status IN ('pending', 'confirmed');


SELECT id, name, email, role
FROM users
ORDER BY id;

SELECT id, clinic_id, specialty
FROM veterinarians;

SELECT
    v.id AS veterinarian_id,
    v.name AS veterinarian_name,
    u.id AS user_id,
    u.email,
    u.role
FROM veterinarians v
JOIN users u ON u.id = v.user_id;

-- مشاهده نوبت‌های فعلی
SELECT
    id,
    pet_id,
    clinic_id,
    veterinarian_id,
    appointment_date,
    appointment_time,
    status
FROM appointments
ORDER BY id;

INSERT INTO appointments (
    pet_id,
    clinic_id,
    veterinarian_id,
    appointment_date,
    appointment_time,
    status,
    description
)
VALUES (
    11,
    1,
    1,
    CURRENT_DATE + INTERVAL '1 day',
    '10:00',
    'pending',
    'نوبت آزمایشی برای تست پنل دامپزشک'
)
RETURNING *;