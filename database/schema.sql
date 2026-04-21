-- Database Creation
DROP DATABASE IF EXISTS online_examination_system_db;
CREATE DATABASE online_examination_system_db;
USE online_examination_system_db;

-- Tables Creation
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

-- Sample Data Insertion
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