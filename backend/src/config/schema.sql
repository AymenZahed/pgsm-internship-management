-- Medical Internship Management Database Schema
-- Run this script to create all necessary tables

CREATE DATABASE IF NOT EXISTS internship_management;
USE internship_management;

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'doctor', 'hospital', 'admin') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- =====================================================
-- STUDENTS
-- =====================================================

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    student_number VARCHAR(50) UNIQUE,
    faculty VARCHAR(200),
    department VARCHAR(200),
    academic_year VARCHAR(50),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    bio TEXT,
    skills JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_number (student_number)
);

-- =====================================================
-- HOSPITALS
-- =====================================================

CREATE TABLE hospitals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type ENUM('public', 'private', 'university', 'clinic') DEFAULT 'public',
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    description TEXT,
    logo VARCHAR(500),
    capacity INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city (city)
);

-- =====================================================
-- DOCTORS / TUTORS
-- =====================================================

CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    hospital_id VARCHAR(36),
    specialization VARCHAR(200),
    department VARCHAR(200),
    title VARCHAR(100),
    license_number VARCHAR(100),
    years_experience INT,
    bio TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    max_students INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
    INDEX idx_hospital (hospital_id),
    INDEX idx_specialization (specialization)
);

-- =====================================================
-- HOSPITAL SERVICES
-- =====================================================

CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hospital_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(200),
    description TEXT,
    capacity INT DEFAULT 0,
    floor VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    head_doctor_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    accepts_interns BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (head_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_hospital (hospital_id)
);

-- =====================================================
-- INTERNSHIP OFFERS (STAGES)
-- =====================================================

CREATE TABLE stage_offers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hospital_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    department VARCHAR(200),
    type ENUM('required', 'optional', 'summer') DEFAULT 'required',
    duration_weeks INT NOT NULL,
    positions INT DEFAULT 1,
    filled_positions INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    application_deadline DATE,
    status ENUM('draft', 'published', 'closed', 'cancelled') DEFAULT 'draft',
    skills_required JSON,
    benefits TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_hospital (hospital_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- =====================================================
-- APPLICATIONS
-- =====================================================

CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    offer_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    cover_letter TEXT,
    motivation TEXT,
    experience TEXT,
    availability_date DATE,
    notes TEXT,
    reviewed_by VARCHAR(36),
    reviewed_at DATETIME,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES stage_offers(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_application (student_id, offer_id),
    INDEX idx_student (student_id),
    INDEX idx_offer (offer_id),
    INDEX idx_status (status)
);

-- =====================================================
-- INTERNSHIPS (ACTIVE/COMPLETED)
-- =====================================================

CREATE TABLE internships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    application_id VARCHAR(36) NOT NULL UNIQUE,
    student_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36),
    tutor_id VARCHAR(36),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    progress INT DEFAULT 0,
    total_hours INT DEFAULT 0,
    completed_hours INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (tutor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_hospital (hospital_id),
    INDEX idx_status (status)
);

-- =====================================================
-- ATTENDANCE / PRESENCE
-- =====================================================

CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    internship_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('pending', 'present', 'absent', 'late', 'excused', 'approved', 'rejected') DEFAULT 'pending',
    hours_worked DECIMAL(4,2),
    notes TEXT,
    validated_by VARCHAR(36),
    validated_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (internship_id, date),
    INDEX idx_internship (internship_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- =====================================================
-- LOGBOOK ENTRIES
-- =====================================================

CREATE TABLE logbook_entries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    internship_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255),
    activities TEXT NOT NULL,
    skills_learned TEXT,
    reflections TEXT,
    challenges TEXT,
    supervisor_comments TEXT,
    status ENUM('draft', 'pending', 'approved', 'revision_requested') DEFAULT 'draft',
    reviewed_by VARCHAR(36),
    reviewed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_internship (internship_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- =====================================================
-- EVALUATIONS
-- =====================================================

CREATE TABLE evaluations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    internship_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    evaluator_id VARCHAR(36) NOT NULL,
    type ENUM('mid-term', 'final', 'monthly') DEFAULT 'final',
    overall_score DECIMAL(5,2),
    technical_skills_score DECIMAL(5,2),
    patient_relations_score DECIMAL(5,2),
    teamwork_score DECIMAL(5,2),
    professionalism_score DECIMAL(5,2),
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    feedback TEXT,
    status ENUM('draft', 'submitted', 'acknowledged') DEFAULT 'draft',
    acknowledged_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_internship (internship_id),
    INDEX idx_student (student_id),
    INDEX idx_evaluator (evaluator_id)
);

-- =====================================================
-- MESSAGES
-- =====================================================

CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type ENUM('direct', 'group') DEFAULT 'direct',
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id),
    INDEX idx_conversation (conversation_id),
    INDEX idx_user (user_id)
);

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
);

CREATE TABLE message_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    message_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_message (message_id)
);

-- =====================================================
-- DOCUMENTS
-- =====================================================

CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    application_id VARCHAR(36),
    type ENUM('cv', 'cover_letter', 'certificate', 'id_card', 'transcript', 'other') NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by VARCHAR(36),
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_application (application_id),
    INDEX idx_type (type)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- =====================================================
-- ACTIVITY LOGS
-- =====================================================

CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- =====================================================
-- SETTINGS
-- =====================================================

CREATE TABLE settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    language VARCHAR(10) DEFAULT 'fr',
    theme VARCHAR(20) DEFAULT 'system',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    student_updates BOOLEAN DEFAULT TRUE,
    logbook_alerts BOOLEAN DEFAULT TRUE,
    message_alerts BOOLEAN DEFAULT TRUE,
    evaluation_reminders BOOLEAN DEFAULT TRUE,
    daily_digest BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    session_timeout VARCHAR(20) DEFAULT '60',
    login_alerts BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'Africa/Casablanca',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS system_config (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- REPORTS
-- =====================================================

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status ENUM('generating', 'ready', 'failed') DEFAULT 'generating',
    file_path VARCHAR(500),
    file_size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUPPORT TICKETS
-- =====================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'low',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_responses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ticket_id VARCHAR(36) NOT NULL,
    responder_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERT DEFAULT ADMIN USER
-- =====================================================

INSERT INTO users (id, email, password, role, first_name, last_name, is_active, email_verified) 
VALUES (
    UUID(),
    'admin@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
    'admin',
    'System',
    'Administrator',
    TRUE,
    TRUE
);
