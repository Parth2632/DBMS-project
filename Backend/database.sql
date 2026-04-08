
---

## `database.sql`

Put only SQL in this file:

```sql
CREATE DATABASE IF NOT EXISTS visitor_access_management;
USE visitor_access_management;

-- =========================
-- 1. TABLE CREATION
-- =========================

CREATE TABLE visitor (
    visitor_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE,
    id_proof_type VARCHAR(50) NOT NULL,
    id_proof_number VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE host (
    host_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone_no VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    host_type ENUM('Student', 'Faculty', 'Staff') NOT NULL,
    roll_number VARCHAR(20) UNIQUE
);

CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_no VARCHAR(15),
    role ENUM('Security', 'Admin', 'SuperAdmin') NOT NULL
);

CREATE TABLE visit_request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id INT NOT NULL,
    host_id INT NOT NULL,
    visit_date DATE NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    approval_status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by_admin_id INT,
    approval_time DATETIME,
    rejection_reason VARCHAR(255),

    FOREIGN KEY (visitor_id) REFERENCES visitor(visitor_id),
    FOREIGN KEY (host_id) REFERENCES host(host_id),
    FOREIGN KEY (approved_by_admin_id) REFERENCES admin(admin_id)
);

CREATE TABLE entry_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNIQUE,
    entry_time DATETIME,
    exit_time DATETIME,

    FOREIGN KEY (request_id) REFERENCES visit_request(request_id)
);

-- =========================
-- 2. SAMPLE DATA
-- =========================

INSERT INTO visitor (full_name, phone_no, email, id_proof_type, id_proof_number)
VALUES
('Rahul Sharma', '9876543210', 'rahul@gmail.com', 'Aadhar', 'A123456789'),
('Priya Verma', '9123456780', 'priya@gmail.com', 'PAN', 'ABCDE1234F'),
('Aman Gupta', '9988776655', 'aman@gmail.com', 'Driving License', 'DL987654321');

INSERT INTO host (full_name, department, phone_no, email, host_type, roll_number)
VALUES
('Parth Arora', 'COE', '9012345678', 'parth@student.thapar.edu', 'Student', '1024030122'),
('Dr. Mehta', 'CSE', '9999999999', 'mehta@thapar.edu', 'Faculty', NULL),
('Rohit Sharma', 'Administration', '8888888888', 'rohit@thapar.edu', 'Staff', NULL);

INSERT INTO admin (full_name, email, phone_no, role)
VALUES
('Security Head', 'security@campus.com', '9876501234', 'Security'),
('Main Admin', 'admin@campus.com', '9123405678', 'Admin');

INSERT INTO visit_request (visitor_id, host_id, visit_date, purpose)
VALUES
(1, 1, '2026-04-06', 'Project Discussion'),
(2, 2, '2026-04-06', 'Academic Meeting'),
(3, 3, '2026-04-06', 'Office Work'),
(1, 2, '2026-04-07', 'Internship Guidance');

-- =========================
-- 3. APPROVAL / REJECTION
-- =========================

UPDATE visit_request
SET approval_status = 'Approved',
    approved_by_admin_id = 2,
    approval_time = NOW()
WHERE request_id = 1;

UPDATE visit_request
SET approval_status = 'Approved',
    approved_by_admin_id = 2,
    approval_time = NOW()
WHERE request_id = 2;

UPDATE visit_request
SET approval_status = 'Rejected',
    approved_by_admin_id = 2,
    approval_time = NOW(),
    rejection_reason = 'Visitor does not have valid appointment'
WHERE request_id = 3;

-- request 4 remains pending

-- =========================
-- 4. ENTRY / EXIT LOGGING
-- =========================

INSERT INTO entry_log (request_id, entry_time)
VALUES
(1, NOW()),
(2, NOW());

UPDATE entry_log
SET exit_time = NOW()
WHERE request_id = 1;

UPDATE visit_request
SET approval_status = 'Completed'
WHERE request_id = 1;

-- =========================
-- 5. BASIC CHECK QUERIES
-- =========================

SELECT * FROM visitor;
SELECT * FROM host;
SELECT * FROM admin;
SELECT * FROM visit_request;
SELECT * FROM entry_log;

-- =========================
-- 6. USEFUL JOIN QUERIES
-- =========================

SELECT 
    vr.request_id,
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    vr.visit_date,
    vr.purpose,
    vr.approval_status,
    vr.requested_at
FROM visit_request vr
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id;

SELECT 
    vr.request_id,
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    vr.visit_date,
    vr.purpose,
    a.full_name AS approved_by,
    vr.approval_time
FROM visit_request vr
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id
LEFT JOIN admin a ON vr.approved_by_admin_id = a.admin_id
WHERE vr.approval_status = 'Approved';

SELECT 
    vr.request_id,
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    vr.visit_date,
    vr.purpose
FROM visit_request vr
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id
WHERE vr.approval_status = 'Pending';

SELECT 
    vr.request_id,
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    vr.rejection_reason
FROM visit_request vr
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id
WHERE vr.approval_status = 'Rejected';

SELECT 
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    e.entry_time
FROM entry_log e
JOIN visit_request vr ON e.request_id = vr.request_id
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id
WHERE e.exit_time IS NULL;

SELECT 
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    vr.visit_date,
    vr.purpose,
    e.entry_time,
    e.exit_time
FROM entry_log e
JOIN visit_request vr ON e.request_id = vr.request_id
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id;

SELECT 
    v.full_name AS visitor_name,
    h.full_name AS host_name,
    e.entry_time,
    e.exit_time,
    TIMESTAMPDIFF(MINUTE, e.entry_time, e.exit_time) AS total_visit_minutes
FROM entry_log e
JOIN visit_request vr ON e.request_id = vr.request_id
JOIN visitor v ON vr.visitor_id = v.visitor_id
JOIN host h ON vr.host_id = h.host_id
WHERE e.exit_time IS NOT NULL;

SELECT 
    h.full_name AS host_name,
    COUNT(vr.request_id) AS total_requests
FROM host h
LEFT JOIN visit_request vr ON h.host_id = vr.host_id
GROUP BY h.host_id, h.full_name;

SELECT 
    v.full_name AS visitor_name,
    COUNT(vr.request_id) AS total_requests
FROM visitor v
LEFT JOIN visit_request vr ON v.visitor_id = vr.visitor_id
GROUP BY v.visitor_id, v.full_name;