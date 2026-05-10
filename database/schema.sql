-- =====================================================
-- DATABASE INITIALIZATION
-- =====================================================

DROP DATABASE IF EXISTS online_examination_system_db;
CREATE DATABASE online_examination_system_db;
USE online_examination_system_db;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    address_street VARCHAR(100) NULL,
    address_city VARCHAR(50) NULL,
    address_zip VARCHAR(10) NULL,
    enrollment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE instructors (
    instructor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    department VARCHAR(100) NULL,
    office VARCHAR(50) NULL,
    hire_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    access_level ENUM('full', 'readonly', 'support') NOT NULL DEFAULT 'full',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    credit_hours INT NOT NULL DEFAULT 3,
    CONSTRAINT chk_credit_hours CHECK (credit_hours > 0 AND credit_hours <= 6)
);

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL
);

CREATE TABLE exams (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    passing_marks INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    course_id INT NOT NULL,
    category_id INT NULL,
    instructor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE RESTRICT,
    CONSTRAINT chk_exam_timing CHECK (end_time > start_time),
    CONSTRAINT chk_passing_marks CHECK (passing_marks <= total_marks)
);

CREATE TABLE course_instructors (
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    assigned_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (course_id, instructor_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE
);

CREATE TABLE exam_enrollments (
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('MCQ', 'SHORT_ANSWER') NOT NULL,
    options JSON NULL,
    correct_answer TEXT NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    question_order INT NOT NULL DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    CONSTRAINT chk_marks_positive CHECK (marks > 0)
);

CREATE TABLE exam_attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    score DECIMAL(10,2) NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

CREATE TABLE student_answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    given_answer TEXT NOT NULL,
    marks_obtained DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    UNIQUE KEY unique_attempt_question (attempt_id, question_id)
);

-- =====================================================
-- DATABASE INSERT QUERIES
-- =====================================================

INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES
('Ahmed', 'Hassan', 'ahmed.hassan@student.edu', 'hash123', 'student'),
('Sara', 'Mahmoud', 'sara.mahmoud@student.edu', 'hash456', 'student'),
('Dr. Khaled', 'Ibrahim', 'khaled.ibrahim@university.edu', 'hash789', 'instructor'),
('Dr. Mona', 'Sayed', 'mona.sayed@university.edu', 'hashabc', 'instructor'),
('Admin', 'System', 'admin@examsystem.edu', 'hashdef', 'admin');

INSERT INTO students (user_id, phone, address_street, address_city, address_zip, enrollment_date) VALUES
(1, '01012345678', '15 Tahrir Street', 'Cairo', '11511', '2025-09-15'),
(2, '01298765432', '22 Corniche Road', 'Alexandria', '21500', '2025-09-15');

INSERT INTO instructors (user_id, department, office, hire_date) VALUES
(3, 'Computer Science', 'Room 304', '2020-08-01'),
(4, 'Information Systems', 'Room 215', '2021-08-01');

INSERT INTO admins (user_id, access_level) VALUES
(5, 'full');

INSERT INTO courses (course_code, course_name, description, credit_hours) VALUES
('CS101', 'Introduction to Programming', 'Basic programming concepts using Python', 4),
('IS201', 'Database Systems', 'Fundamentals of relational database design and SQL', 4),
('CS301', 'Data Structures', 'Advanced data structures and algorithms', 3);

INSERT INTO categories (category_name, description) VALUES
('Midterm', 'Mid-semester examination'),
('Final', 'End of semester comprehensive examination'),
('Quiz', 'Short weekly assessment');

INSERT INTO course_instructors (course_id, instructor_id, assigned_date) VALUES
(1, 1, '2025-09-01'),
(2, 1, '2025-09-01'),
(2, 2, '2025-09-01'),
(3, 1, '2025-09-01');

INSERT INTO exams (title, description, duration_minutes, total_marks, passing_marks, start_time, end_time, is_published, course_id, category_id, instructor_id) VALUES
('CS101 Midterm Exam', 'Covers variables, loops, and functions', 90, 100, 60, '2026-04-25 09:00:00', '2026-04-25 10:30:00', TRUE, 1, 1, 1),
('IS201 Database Design Exam', 'ERD diagrams, normalization, and SQL queries', 120, 100, 70, '2026-04-28 11:00:00', '2026-04-28 13:00:00', TRUE, 2, 1, 1),
('CS101 Final Exam', 'Comprehensive Python programming', 180, 150, 90, '2026-05-20 09:00:00', '2026-05-20 12:00:00', FALSE, 1, 2, 1),
('IS201 SQL Quiz', 'Basic SQL SELECT statements', 30, 50, 30, '2026-04-22 14:00:00', '2026-04-22 14:30:00', TRUE, 2, 3, 2);

INSERT INTO exam_enrollments (exam_id, student_id, enrolled_at) VALUES
(1, 1, '2026-04-20 08:00:00'),
(1, 2, '2026-04-20 08:15:00'),
(2, 1, '2026-04-21 09:00:00'),
(2, 2, '2026-04-21 09:30:00'),
(4, 1, '2026-04-21 13:00:00'),
(4, 2, '2026-04-21 13:10:00');

INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks, question_order) VALUES
(1, 'What is the output of: print(2 ** 3)?', 'MCQ', '["6", "8", "9", "5"]', '8', 10, 1),
(1, 'Which keyword is used to define a function in Python?', 'MCQ', '["func", "define", "def", "function"]', 'def', 10, 2),
(1, 'Explain the difference between a list and a tuple in Python.', 'SHORT_ANSWER', NULL, 'Lists are mutable, tuples are immutable', 15, 3),
(1, 'What does the len() function return?', 'MCQ', '["Memory size", "Number of elements", "Data type", "None"]', 'Number of elements', 5, 4),
(2, 'Which normal form eliminates transitive dependency?', 'MCQ', '["1NF", "2NF", "3NF", "BCNF"]', '3NF', 10, 1),
(2, 'Write a SQL query to select all students with age > 20.', 'SHORT_ANSWER', NULL, 'SELECT * FROM students WHERE age > 20;', 15, 2),
(2, 'What does ACID stand for in database transactions?', 'SHORT_ANSWER', NULL, 'Atomicity, Consistency, Isolation, Durability', 10, 3),
(4, 'Which SQL statement is used to retrieve data?', 'MCQ', '["INSERT", "UPDATE", "SELECT", "DELETE"]', 'SELECT', 5, 1),
(4, 'What is a primary key?', 'SHORT_ANSWER', NULL, 'A unique identifier for each row in a table', 10, 2);

INSERT INTO exam_attempts (student_id, exam_id, start_time, end_time, score) VALUES
(1, 1, '2026-04-25 09:00:00', '2026-04-25 10:15:00', 85.00),
(2, 1, '2026-04-25 09:05:00', '2026-04-25 10:20:00', 72.00),
(1, 2, '2026-04-28 11:00:00', '2026-04-28 12:45:00', 88.00),
(1, 4, '2026-04-22 14:00:00', '2026-04-22 14:22:00', 45.00),
(2, 4, '2026-04-22 14:05:00', '2026-04-22 14:28:00', 40.00);

INSERT INTO student_answers (attempt_id, question_id, given_answer, marks_obtained) VALUES
(1, 1, '8', 10),
(1, 2, 'def', 10),
(1, 3, 'Lists can be modified, tuples cannot be changed', 12),
(1, 4, 'Number of elements', 5),
(2, 1, '9', 0),
(2, 2, 'def', 10),
(2, 3, 'One is changeable, other is not', 10),
(2, 4, 'Number of elements', 5),
(3, 5, '3NF', 10),
(3, 6, 'SELECT * FROM students WHERE age > 20;', 15),
(3, 7, 'Atomicity, Consistency, Isolation, Durability', 10),
(4, 8, 'SELECT', 5),
(4, 9, 'Unique identifier for table records', 8),
(5, 8, 'SELECT', 5),
(5, 9, 'Key that identifies a row', 7);


-- =====================================================
-- SQL Queries (CRUD Operations)
-- =====================================================

-- =====================================================
-- CREATE (INSERT) - Adding new records
-- =====================================================

-- Insert a new user
INSERT INTO users (first_name, last_name, email, password_hash, role) 
VALUES ('John', 'Doe', 'john.doe@student.edu', 'hash123', 'student');

-- Insert a new course
INSERT INTO courses (course_code, course_name, description, credit_hours) 
VALUES ('CS202', 'Web Development', 'Learn HTML, CSS, JavaScript', 3);

-- Insert a new exam
INSERT INTO exams (title, description, duration_minutes, total_marks, passing_marks, start_time, end_time, course_id, instructor_id) 
VALUES ('JavaScript Quiz', 'Basic JavaScript concepts', 60, 100, 50, '2026-05-01 10:00:00', '2026-05-01 11:00:00', 1, 1);

-- Enroll a student in an exam
INSERT INTO exam_enrollments (exam_id, student_id) 
VALUES (1, 1);

-- =====================================================
-- READ (SELECT) - Retrieval queries
-- =====================================================

-- Get all users
SELECT * FROM users;

-- Get all students
SELECT * FROM students;

-- Get all exams
SELECT * FROM exams;

-- Get a specific user by email
SELECT * FROM users WHERE email = 'ahmed.hassan@student.edu';

-- Get all exams for a specific course
SELECT * FROM exams WHERE course_id = 1;

-- Get all questions for a specific exam
SELECT * FROM questions WHERE exam_id = 1;

-- Get student exam attempts
SELECT * FROM exam_attempts WHERE student_id = 1;

-- Get passed exams only
SELECT * FROM exam_attempts WHERE score >= 60;

-- =====================================================
-- UPDATE - Modifying existing records
-- =====================================================

-- Update user's last name
UPDATE users 
SET last_name = 'Smith' 
WHERE user_id = 1;

-- Update student's phone number
UPDATE students 
SET phone = '01123456789' 
WHERE student_id = 1;

-- Update exam passing marks
UPDATE exams 
SET passing_marks = 65 
WHERE exam_id = 1;

-- Mark exam as published
UPDATE exams 
SET is_published = TRUE 
WHERE exam_id = 1;

-- Update a question's marks
UPDATE questions 
SET marks = 5 
WHERE question_id = 1;

-- =====================================================
-- DELETE - Removing records
-- =====================================================

-- Delete a specific exam enrollment
DELETE FROM exam_enrollments 
WHERE exam_id = 4 AND student_id = 2;

-- Delete a specific question
DELETE FROM questions 
WHERE question_id = 9;

-- Delete an exam attempt
DELETE FROM exam_attempts 
WHERE attempt_id = 4;

-- =====================================================
-- BASIC AGGREGATION (Simple calculations)
-- =====================================================

-- Count total number of students
SELECT COUNT(*) AS total_students FROM students;

-- Average score of all exam attempts
SELECT AVG(score) AS average_score FROM exam_attempts;

-- Highest score in an exam
SELECT MAX(score) AS highest_score FROM exam_attempts WHERE exam_id = 1;

-- Total marks for an exam
SELECT SUM(marks) AS total_marks FROM questions WHERE exam_id = 1;

-- Count how many exams each student took
SELECT student_id, COUNT(*) AS exams_taken 
FROM exam_attempts 
GROUP BY student_id;

-- =====================================================
-- INNER, LEFT, and RIGHT JOINS
-- =====================================================

-- =====================================================
-- INNER JOIN - Get matching records from both tables
-- =====================================================

-- INNER JOIN: Get students with their user details (only matching records)
SELECT s.student_id, u.first_name, u.last_name, s.phone, s.enrollment_date
FROM students s
INNER JOIN users u ON s.user_id = u.user_id;

-- INNER JOIN: Get exams with their course names
SELECT e.exam_id, e.title, c.course_name, e.start_time
FROM exams e
INNER JOIN courses c ON e.course_id = c.course_id;

-- INNER JOIN: Get exam attempts with student names
SELECT ea.attempt_id, u.first_name, u.last_name, ea.score, ea.start_time
FROM exam_attempts ea
INNER JOIN students s ON ea.student_id = s.student_id
INNER JOIN users u ON s.user_id = u.user_id;

-- INNER JOIN: Get questions with their exam titles
SELECT q.question_id, q.question_text, e.title AS exam_title, q.marks
FROM questions q
INNER JOIN exams e ON q.exam_id = e.exam_id;

-- INNER JOIN: Get student answers with question text and exam title
SELECT sa.answer_id, u.first_name, q.question_text, sa.given_answer, sa.marks_obtained
FROM student_answers sa
INNER JOIN exam_attempts ea ON sa.attempt_id = ea.attempt_id
INNER JOIN students s ON ea.student_id = s.student_id
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN questions q ON sa.question_id = q.question_id;

-- =====================================================
-- LEFT JOIN - Get ALL records from left table, matching from right
-- =====================================================

-- LEFT JOIN: All courses, even those without exams
SELECT c.course_code, c.course_name, e.title AS exam_title
FROM courses c
LEFT JOIN exams e ON c.course_id = e.course_id;

-- LEFT JOIN: All students, even those without exam attempts
SELECT u.first_name, u.last_name, ea.attempt_id, ea.score
FROM students s
LEFT JOIN exam_attempts ea ON s.student_id = ea.student_id
LEFT JOIN users u ON s.user_id = u.user_id;

-- LEFT JOIN: All users, even those who are not students
SELECT u.user_id, u.first_name, u.last_name, u.role, s.student_id
FROM users u
LEFT JOIN students s ON u.user_id = s.user_id;

-- LEFT JOIN: All instructors, even those without courses assigned
SELECT CONCAT(u.first_name, ' ', u.last_name) AS instructor_name, 
       ci.course_id, c.course_code
FROM instructors i
LEFT JOIN users u ON i.user_id = u.user_id
LEFT JOIN course_instructors ci ON i.instructor_id = ci.instructor_id
LEFT JOIN courses c ON ci.course_id = c.course_id;

-- LEFT JOIN: All exams, even those with no student enrollments
SELECT e.title, e.start_time, COUNT(ee.student_id) AS enrolled_students
FROM exams e
LEFT JOIN exam_enrollments ee ON e.exam_id = ee.exam_id
GROUP BY e.exam_id, e.title, e.start_time;

-- =====================================================
-- RIGHT JOIN - Get ALL records from right table, matching from left
-- =====================================================

-- RIGHT JOIN: All exams, even if they don't belong to a course (rare)
SELECT e.title, c.course_name
FROM courses c
RIGHT JOIN exams e ON c.course_id = e.course_id;

-- RIGHT JOIN: All users, even if they are not instructors
SELECT u.first_name, u.last_name, i.instructor_id, i.department
FROM instructors i
RIGHT JOIN users u ON i.user_id = u.user_id;

-- RIGHT JOIN: All courses, even if no instructor assigned
SELECT c.course_code, c.course_name, CONCAT(u.first_name, ' ', u.last_name) AS instructor_name
FROM instructors i
RIGHT JOIN course_instructors ci ON i.instructor_id = ci.instructor_id
RIGHT JOIN courses c ON ci.course_id = c.course_id
LEFT JOIN users u ON i.user_id = u.user_id;

-- RIGHT JOIN: All students, even if they have no exam enrollments
SELECT u.first_name, u.last_name, ee.exam_id, e.title
FROM exam_enrollments ee
RIGHT JOIN students s ON ee.student_id = s.student_id
RIGHT JOIN users u ON s.user_id = u.user_id
LEFT JOIN exams e ON ee.exam_id = e.exam_id;

-- =====================================================
-- COMPARISON EXAMPLES
-- =====================================================

-- EXAMPLE 1: See what INNER JOIN vs LEFT JOIN returns

-- INNER JOIN: Only courses WITH exams
SELECT c.course_name, e.title
FROM courses c
INNER JOIN exams e ON c.course_id = e.course_id;

-- LEFT JOIN: ALL courses, even those WITHOUT exams
SELECT c.course_name, e.title
FROM courses c
LEFT JOIN exams e ON c.course_id = e.course_id;

-- EXAMPLE 2: Students with attempts vs All students

-- INNER JOIN: Only students who HAVE taken exams
SELECT DISTINCT u.first_name, u.last_name
FROM students s
INNER JOIN exam_attempts ea ON s.student_id = ea.student_id
INNER JOIN users u ON s.user_id = u.user_id;

-- LEFT JOIN: ALL students, even those who NEVER took an exam
SELECT u.first_name, u.last_name, ea.attempt_id
FROM students s
LEFT JOIN exam_attempts ea ON s.student_id = ea.student_id
LEFT JOIN users u ON s.user_id = u.user_id;

-- =====================================================
-- REAL EXAMPLES WITH NULL VALUES
-- =====================================================

-- Find courses with no exams (using LEFT JOIN with WHERE NULL)
SELECT c.course_code, c.course_name
FROM courses c
LEFT JOIN exams e ON c.course_id = e.course_id
WHERE e.exam_id IS NULL;

-- Find students who never attempted any exam
SELECT u.first_name, u.last_name
FROM students s
LEFT JOIN exam_attempts ea ON s.student_id = ea.student_id
LEFT JOIN users u ON s.user_id = u.user_id
WHERE ea.attempt_id IS NULL;

-- Find exams with no student enrollments
SELECT e.title, e.start_time
FROM exams e
LEFT JOIN exam_enrollments ee ON e.exam_id = ee.exam_id
WHERE ee.student_id IS NULL;

-- =====================================================
-- ORDER BY
-- =====================================================

-- Sort users by name (A to Z)
SELECT * FROM users ORDER BY first_name ASC;

-- Sort exams by date (newest first)
SELECT * FROM exams ORDER BY start_time DESC;

-- Sort students by highest score
SELECT student_id, score FROM exam_attempts ORDER BY score DESC;

-- Sort courses by credit hours (smallest to largest)
SELECT * FROM courses ORDER BY credit_hours ASC;

-- =====================================================
-- BASIC FILTERING (WHERE clause)
-- =====================================================

-- Get active users only
SELECT * FROM users WHERE is_active = TRUE;

-- Get exams longer than 60 minutes
SELECT * FROM exams WHERE duration_minutes > 60;

-- Get students who failed an exam
SELECT * FROM exam_attempts WHERE score < 60;

-- Get exams happening today
SELECT * FROM exams WHERE DATE(start_time) = CURDATE();

-- Get questions that are multiple choice
SELECT * FROM questions WHERE question_type = 'MCQ';

-- =====================================================
-- BASIC GROUP BY
-- =====================================================

-- Count exams by type
SELECT question_type, COUNT(*) FROM questions GROUP BY question_type;

-- Average score by exam
SELECT exam_id, AVG(score) FROM exam_attempts GROUP BY exam_id;

-- Count students by city
SELECT address_city, COUNT(*) FROM students GROUP BY address_city;

-- Total marks by question type
SELECT question_type, SUM(marks) FROM questions GROUP BY question_type;

-- =====================================================
-- SIMPLE DELETE WITH CONDITIONS
-- =====================================================

-- Delete old exam attempts (older than 1 year)
DELETE FROM exam_attempts 
WHERE start_time < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Delete inactive users
DELETE FROM users 
WHERE is_active = FALSE AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Delete unenrolled exam attempts
DELETE FROM exam_attempts 
WHERE exam_id NOT IN (SELECT exam_id FROM exam_enrollments);