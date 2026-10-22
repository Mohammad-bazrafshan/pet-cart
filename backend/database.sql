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

CREATE TABLE clinic_cooperation_requests (
    id SERIAL PRIMARY KEY,
    clinic_name VARCHAR(150) NOT NULL,
    manager_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    city VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name



ALTER TABLE appointments
ADD CONSTRAINT chk_appointments_status
CHECK (
    status IN (
        'pending',
        'confirmed',
        'completed',
        'cancelled'
    )
);

ALTER TABLE reminders
ADD CONSTRAINT chk_reminders_type
CHECK (
    type IN (
        'vaccination',
        'medication',
        'checkup',
        'other'
    )
);

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass
  AND contype = 'f';

  ALTER TABLE veterinarians
ADD CONSTRAINT uq_veterinarian_clinic
UNIQUE (id, clinic_id);



ALTER TABLE appointments
ADD CONSTRAINT fk_appointment_vet_clinic
FOREIGN KEY (veterinarian_id, clinic_id)
REFERENCES veterinarians (id, clinic_id)
ON DELETE CASCADE;



SELECT
    id,
    clinic_name,
    manager_name,
    phone,
    city,
    status,
    created_at
FROM clinic_cooperation_requests
ORDER BY created_at DESC;




SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clinics'
ORDER BY ordinal_position;



ALTER TABLE clinics
ADD COLUMN province VARCHAR(100),
ADD COLUMN city VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7);



ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS vet_license_number VARCHAR(50);

ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS province VARCHAR(100);

ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS license_document_path TEXT;




-- اطلاعات تکمیلی کلینیک
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS manager_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vet_license_number VARCHAR(50);

-- اطلاعات دامپزشکی که الزاماً حساب کاربری ندارد
ALTER TABLE veterinarians
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE veterinarians
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);


ALTER TABLE clinic_cooperation_requests
  ADD COLUMN IF NOT EXISTS vet_full_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS vet_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS vet_specialty VARCHAR(150);


-- اطلاعات دامپزشک در درخواست همکاری
ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS vet_full_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS vet_phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS vet_specialty VARCHAR(150);

-- اطلاعات تکمیلی کلینیک
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS manager_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS vet_license_number VARCHAR(50);

-- پشتیبانی از دامپزشکانی که حساب کاربری ندارند
ALTER TABLE veterinarians
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE veterinarians
ADD COLUMN IF NOT EXISTS full_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);

ALTER TABLE clinic_cooperation_requests
  ADD COLUMN IF NOT EXISTS vet_full_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS vet_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS vet_specialty VARCHAR(150);

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS manager_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vet_license_number VARCHAR(50);

ALTER TABLE veterinarians
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE veterinarians
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);




SELECT
    v.id AS veterinarian_id,
    v.user_id,
    v.full_name,
    v.phone,
    v.license_number,
    v.specialty,
    c.id AS clinic_id,
    c.name AS clinic_name
FROM veterinarians v
JOIN clinics c ON c.id = v.clinic_id
ORDER BY v.id DESC;


  SELECT
    id,
    name,
    manager_name,
    phone,
    province,
    city,
    vet_license_number,
    created_at
FROM clinics
ORDER BY id DESC;


SELECT * FROM clinics LIMIT 5;

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clinics'
ORDER BY ordinal_position;



CREATE TABLE IF NOT EXISTS veterinarian_cooperation_requests (
    id SERIAL PRIMARY KEY,

    veterinarian_user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    clinic_id INTEGER NOT NULL
        REFERENCES clinics(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (veterinarian_user_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_vet_cooperation_clinic_status
ON veterinarian_cooperation_requests (clinic_id, status);

CREATE INDEX IF NOT EXISTS idx_vet_cooperation_user
ON veterinarian_cooperation_requests (veterinarian_user_id);




SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'veterinarians'
ORDER BY ordinal_position;


-- اضافه کردن استان و شهر به کلینیک‌ها
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- ثبت درخواست‌های عمومی همکاری دامپزشکان
CREATE TABLE IF NOT EXISTS veterinarian_applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    specialty VARCHAR(150) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    work_type VARCHAR(50),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_veterinarian_application_status
        CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_clinics_city_province
ON clinics (province, city);

CREATE INDEX IF NOT EXISTS idx_veterinarian_applications_status
ON veterinarian_applications (status);

SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
      'veterinarian_applications',
      'veterinarians',
      'clinics'
  )
ORDER BY table_name, ordinal_position;


ALTER TABLE veterinarian_applications
ADD COLUMN IF NOT EXISTS clinic_id INTEGER
REFERENCES clinics(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_veterinarian_applications_clinic_status
ON veterinarian_applications (clinic_id, status);


-- PetCard: add email and hashed password to veterinarian applications.
-- Run this once against the PetCard PostgreSQL database.

ALTER TABLE veterinarian_applications
  ADD COLUMN IF NOT EXISTS email VARCHAR(254),
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_veterinarian_applications_email_status
  ON veterinarian_applications (LOWER(email), status);



ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS email VARCHAR(254),
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE clinic_cooperation_requests
ADD COLUMN IF NOT EXISTS vet_license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS license_document_path TEXT,
ADD COLUMN IF NOT EXISTS vet_full_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS vet_phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS vet_specialty VARCHAR(150),
ADD COLUMN IF NOT EXISTS email VARCHAR(150),
ADD COLUMN IF NOT EXISTS password_hash TEXT;


SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clinic_cooperation_requests'
ORDER BY ordinal_position;



BEGIN;

-- اضافه کردن نقش‌های جدید
ALTER TABLE users
DROP CONSTRAINT IF EXISTS chk_users_role;

ALTER TABLE users
ADD CONSTRAINT chk_users_role
CHECK (
  role IN (
    'owner',
    'veterinarian',
    'admin',
    'trainer',
    'walker'
  )
);

-- وضعیت تأیید حساب
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approval_status
VARCHAR(20) NOT NULL DEFAULT 'approved';

ALTER TABLE users
ADD CONSTRAINT chk_users_approval_status
CHECK (
  approval_status IN (
    'pending',
    'approved',
    'rejected'
  )
);

COMMIT;



CREATE TABLE IF NOT EXISTS service_providers (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL UNIQUE
    REFERENCES users(id) ON DELETE CASCADE,

  provider_type VARCHAR(20) NOT NULL
    CHECK (provider_type IN ('trainer', 'walker')),

  phone VARCHAR(20),
  province VARCHAR(100),
  city VARCHAR(100),
  address TEXT,

  bio TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0
    CHECK (experience_years >= 0),

  specialties TEXT[] NOT NULL DEFAULT '{}',

  price NUMERIC(12, 2)
    CHECK (price IS NULL OR price >= 0),

  price_unit VARCHAR(30),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_providers_type
ON service_providers(provider_type);

CREATE INDEX IF NOT EXISTS idx_service_providers_city
ON service_providers(city);



CREATE TABLE IF NOT EXISTS provider_cooperation_requests (
    id SERIAL PRIMARY KEY,

    provider_type VARCHAR(20) NOT NULL
        CHECK (provider_type IN ('trainer', 'walker')),

    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash TEXT NOT NULL,

    phone VARCHAR(30) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,

    bio TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0
        CHECK (experience_years >= 0),

    specialties TEXT[] NOT NULL DEFAULT '{}',

    price NUMERIC(12, 2)
        CHECK (price IS NULL OR price >= 0),

    price_unit VARCHAR(30),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS
    idx_provider_cooperation_requests_status
ON provider_cooperation_requests(status);

CREATE INDEX IF NOT EXISTS
    idx_provider_cooperation_requests_type
ON provider_cooperation_requests(provider_type);


SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND contype = 'c';



  SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'approval_status';


  SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'service_providers'
ORDER BY ordinal_position;


SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_providers'
ORDER BY ordinal_position;

SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

CREATE TABLE IF NOT EXISTS service_provider_schedules (
    id SERIAL PRIMARY KEY,

    service_provider_id INTEGER NOT NULL
        REFERENCES service_providers(id)
        ON DELETE CASCADE,

    day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

    start_time TIME,
    end_time TIME,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_provider_schedule_day
        UNIQUE (service_provider_id, day_of_week),

    CONSTRAINT valid_schedule_times
        CHECK (
            (is_available = FALSE)
            OR (
                start_time IS NOT NULL
                AND end_time IS NOT NULL
                AND start_time < end_time
            )
        )
);

CREATE TABLE IF NOT EXISTS service_provider_bookings (
    id BIGSERIAL PRIMARY KEY,

    service_provider_id INTEGER NOT NULL
        REFERENCES service_providers(id)
        ON DELETE RESTRICT,

    customer_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_booking_time
        CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS
    idx_provider_bookings_date
ON service_provider_bookings (
    service_provider_id,
    booking_date
);


CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE service_provider_bookings
ADD CONSTRAINT no_overlapping_provider_bookings
EXCLUDE USING gist (
    service_provider_id WITH =,
    tsrange(
        booking_date + start_time,
        booking_date + end_time,
        '[)'
    ) WITH &&
)
WHERE (status IN ('pending', 'confirmed'));



SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;


SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;





ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT;