CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('STUDENT', 'INTERVIEWER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('PENDING_EMAIL', 'ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE interviewer_status AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE booking_status AS ENUM ('PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('CREATED', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE withdrawal_status AS ENUM ('PENDING_ADMIN_REVIEW', 'APPROVED', 'PAID', 'REJECTED');
CREATE TYPE document_type AS ENUM ('RESUME', 'PROFILE_PHOTO', 'COMPANY_ID', 'EXPERIENCE_PROOF');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'PENDING_EMAIL',
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(32),
  password_hash TEXT NOT NULL,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  college VARCHAR(180) NOT NULL,
  branch VARCHAR(120),
  graduation_year INTEGER NOT NULL,
  cgpa NUMERIC(4,2),
  resume_document_id UUID,
  profile_photo_document_id UUID
);

CREATE TABLE interviewer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status interviewer_status NOT NULL DEFAULT 'PENDING_REVIEW',
  current_company VARCHAR(160) NOT NULL,
  current_designation VARCHAR(160) NOT NULL,
  years_of_experience NUMERIC(4,1) NOT NULL,
  linkedin_url TEXT NOT NULL,
  bio TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  base_price_30_min NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(120) NOT NULL,
  storage_key TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE student_profiles
  ADD CONSTRAINT fk_student_resume FOREIGN KEY (resume_document_id) REFERENCES documents(id),
  ADD CONSTRAINT fk_student_photo FOREIGN KEY (profile_photo_document_id) REFERENCES documents(id);

CREATE TABLE technologies (
  id VARCHAR(80) PRIMARY KEY,
  label VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE interviewer_expertise (
  interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(user_id) ON DELETE CASCADE,
  technology_id VARCHAR(80) NOT NULL REFERENCES technologies(id),
  years_experience NUMERIC(4,1),
  PRIMARY KEY (interviewer_id, technology_id)
);

CREATE TABLE interviewer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(user_id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  active BOOLEAN NOT NULL DEFAULT true,
  CHECK (end_time > start_time)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(user_id),
  interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(user_id),
  technology_id VARCHAR(80) NOT NULL REFERENCES technologies(id),
  status booking_status NOT NULL DEFAULT 'PAYMENT_PENDING',
  interview_type VARCHAR(40) NOT NULL DEFAULT 'technical',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meeting_provider VARCHAR(40),
  meeting_url TEXT,
  price_amount NUMERIC(10,2) NOT NULL CHECK (price_amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_bookings_student ON bookings(student_id, starts_at DESC);
CREATE INDEX idx_bookings_interviewer ON bookings(interviewer_id, starts_at DESC);
CREATE UNIQUE INDEX ux_interviewer_booking_slot ON bookings(interviewer_id, starts_at) WHERE status IN ('CONFIRMED', 'SCHEDULED');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  provider VARCHAR(40) NOT NULL,
  provider_order_id VARCHAR(160),
  provider_payment_id VARCHAR(160),
  status payment_status NOT NULL DEFAULT 'CREATED',
  amount NUMERIC(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feedback_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(user_id),
  student_id UUID NOT NULL REFERENCES student_profiles(user_id),
  technical_score SMALLINT NOT NULL CHECK (technical_score BETWEEN 1 AND 5),
  problem_solving_score SMALLINT NOT NULL CHECK (problem_solving_score BETWEEN 1 AND 5),
  coding_score SMALLINT NOT NULL CHECK (coding_score BETWEEN 1 AND 5),
  communication_score SMALLINT NOT NULL CHECK (communication_score BETWEEN 1 AND 5),
  confidence_score SMALLINT NOT NULL CHECK (confidence_score BETWEEN 1 AND 5),
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  hiring_readiness VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE interviewer_payout_accounts (
  interviewer_id UUID PRIMARY KEY REFERENCES interviewer_profiles(user_id) ON DELETE CASCADE,
  upi_id VARCHAR(120),
  account_holder_name VARCHAR(160),
  bank_account_last4 VARCHAR(4),
  ifsc_code VARCHAR(16),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(user_id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status withdrawal_status NOT NULL DEFAULT 'PENDING_ADMIN_REVIEW',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO technologies (id, label, category) VALUES
  ('java-full-stack', 'Java Full Stack', 'Backend'),
  ('python-full-stack', 'Python Full Stack', 'Backend'),
  ('mern-stack', 'MERN Stack', 'Full Stack'),
  ('react', 'React', 'Frontend'),
  ('spring-boot', 'Spring Boot', 'Backend'),
  ('system-design', 'System Design', 'Architecture'),
  ('devops', 'DevOps', 'Cloud'),
  ('dsa', 'DSA', 'Interview Prep'),
  ('hr-interview', 'HR Interview', 'Communication');