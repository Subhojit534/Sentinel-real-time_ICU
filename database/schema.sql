CREATE DATABASE IF NOT EXISTS sentinel_icu;
USE sentinel_icu;

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Wards
CREATE TABLE IF NOT EXISTS wards (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_beds INT NOT NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role ENUM('doctor', 'nurse', 'admin') NOT NULL,
    hospital_id VARCHAR(50) NOT NULL,
    ward_id VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('M', 'F', 'Other') NOT NULL,
    bed_id VARCHAR(50) NOT NULL,
    ward_id VARCHAR(50) NOT NULL,
    admission_date DATE NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    status ENUM('stable', 'watch', 'warning', 'critical', 'code') NOT NULL,
    news2 INT NOT NULL,
    ai_risk_score INT NOT NULL,
    attending_physician VARCHAR(255) NOT NULL,
    primary_nurse VARCHAR(255) NOT NULL,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
);

-- Vitals Current
CREATE TABLE IF NOT EXISTS vitals_current (
    patient_id VARCHAR(50) PRIMARY KEY,
    hr INT NOT NULL,
    spo2 INT NOT NULL,
    sbp INT NOT NULL,
    dbp INT NOT NULL,
    temp DECIMAL(4,1) NOT NULL,
    rr INT NOT NULL,
    map INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Vitals History (Trends)
CREATE TABLE IF NOT EXISTS vitals_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    recorded_at DATETIME NOT NULL,
    hr INT NOT NULL,
    spo2 INT NOT NULL,
    sbp INT NOT NULL,
    dbp INT NOT NULL,
    temp DECIMAL(4,1) NOT NULL,
    rr INT NOT NULL,
    map INT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_time (patient_id, recorded_at)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    ward_id VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    trigger_metric VARCHAR(50) NOT NULL,
    trigger_value VARCHAR(100) NOT NULL,
    normal_range VARCHAR(100) NOT NULL,
    news2 INT NOT NULL,
    severity ENUM('low', 'moderate', 'high', 'critical') NOT NULL,
    status ENUM('active', 'acknowledged', 'escalated', 'resolved') NOT NULL,
    created_at DATETIME NOT NULL,
    acknowledged_at DATETIME NULL,
    resolved_at DATETIME NULL,
    assigned_to VARCHAR(255) NOT NULL,
    escalation_level INT NOT NULL,
    notes TEXT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
);

-- Beds (To track availability, optional if deduced from patients but good to have)
CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(50) PRIMARY KEY,
    ward_id VARCHAR(50) NOT NULL,
    number VARCHAR(10) NOT NULL,
    status ENUM('occupied', 'available', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
    patient_id VARCHAR(50) NULL,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);
