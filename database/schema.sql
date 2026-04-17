-- Database Creation
CREATE DATABASE IF NOT EXISTS online_examination_system_db;
USE online_examination_system_db;

-- Tablee Creation.
-- 1. Users table (main user/participant information)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_role ENUM('student', 'instructor') NOT NULL,
    user_first_name VARCHAR(50) NOT NULL,
    user_last_name VARCHAR(50) NOT NULL,
    user_date_of_birth DATE NOT NULL,
    user_last_login DATETIME NULL,
    user_is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Students table (extends users)
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    student_phone VARCHAR(20) NULL,
    student_address TEXT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Instructors table (extends users)
CREATE TABLE instructors (
    instructor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    instructor_department VARCHAR(100) NULL,
    instructor_office VARCHAR(50) NULL,
    hire_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Categories table (exam categorization)
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT NULL
);

-- 5. Exams table (main activity entity)
CREATE TABLE exams (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_title VARCHAR(150) NOT NULL,
    exam_description TEXT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    passing_marks INT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category_id INT NULL,
    instructor_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE
);

-- 6. Questions table
CREATE TABLE questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('MCQ', 'Short Answer') NOT NULL,
    options JSON NULL COMMENT 'Stores options as JSON array for MCQ',
    correct_answer TEXT NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- 7. Exam results table (transaction/result records)
CREATE TABLE exam_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    is_passed BOOLEAN NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- 8. Student answers table (historical records of activities)
CREATE TABLE student_answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    given_answer TEXT NOT NULL,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_exam_question (student_id, exam_id, question_id)
);

-- Sample Data Inserts
-- Insert Users
INSERT INTO users (user_email, user_password, user_role, user_first_name, user_last_name, user_date_of_birth, user_last_login) VALUES
('john.doe@university.com', 'hash_password_123', 'student', 'John', 'Doe', '2000-05-15', NOW()),
('jane.smith@university.com', 'hash_password_456', 'student', 'Jane', 'Smith', '2001-08-22', NOW()),
('mike.wilson@university.com', 'hash_password_789', 'instructor', 'Mike', 'Wilson', '1985-03-10', NOW()),
('sarah.johnson@university.com', 'hash_password_101', 'instructor', 'Sarah', 'Johnson', '1982-11-30', NOW()),
('alex.brown@university.com', 'hash_password_112', 'student', 'Alex', 'Brown', '1999-12-01', NOW());

-- Insert Students
INSERT INTO students (user_id, student_phone, student_address) VALUES
(1, '+1234567890', '123 Student St, University City'),
(2, '+1234567891', '456 College Ave, University City'),
(5, '+1234567892', '789 Campus Rd, University City');

-- Insert Instructors
INSERT INTO instructors (user_id, instructor_department, instructor_office) VALUES
(3, 'Computer Science', 'CS Building Room 101'),
(4, 'Mathematics', 'Math Building Room 202');

-- Insert Categories
INSERT INTO categories (category_name, category_description) VALUES
('Programming', 'Programming languages and software development'),
('Database', 'Database design and management'),
('Mathematics', 'Mathematical concepts and problem solving'),
('Web Development', 'HTML, CSS, JavaScript and web frameworks');

-- Insert Exams
INSERT INTO exams (exam_title, exam_description, duration_minutes, total_marks, passing_marks, exam_date, start_time, end_time, category_id, instructor_id) VALUES
('Python Programming Basics', 'Basic concepts of Python programming', 60, 100, 40, '2024-12-15', '10:00:00', '11:00:00', 1, 1),
('SQL Fundamentals', 'Basic SQL queries and database concepts', 90, 100, 50, '2024-12-20', '14:00:00', '15:30:00', 2, 1),
('Calculus I', 'Limits, derivatives, and integrals', 120, 100, 60, '2024-12-18', '09:00:00', '11:00:00', 3, 2),
('HTML & CSS Basics', 'Web page structure and styling', 60, 100, 40, '2024-12-22', '11:00:00', '12:00:00', 4, 1);

-- Insert Questions for Exam 1 (Python Programming)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES
(1, 'What is the output of print(2**3)?', 'MCQ', '["5", "6", "8", "9"]', '8', 10),
(1, 'Which of the following is used for comments in Python?', 'MCQ', '["//", "#", "/* */", "<!-- -->"]', '#', 10),
(1, 'Explain what a list is in Python.', 'Short Answer', NULL, 'A list is a mutable, ordered collection that can hold elements of different types.', 10);

-- Insert Questions for Exam 2 (SQL Fundamentals)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES
(2, 'Which SQL statement is used to extract data from a database?', 'MCQ', '["GET", "SELECT", "EXTRACT", "OPEN"]', 'SELECT', 10),
(2, 'What does SQL stand for?', 'MCQ', '["Structured Query Language", "Strong Question Language", "Simple Query Language", "Structured Question Language"]', 'Structured Query Language', 10),
(2, 'Write a query to find all students with age greater than 18.', 'Short Answer', NULL, 'SELECT * FROM students WHERE age > 18;', 20);

-- Insert Exam Results
INSERT INTO exam_results (student_id, exam_id, score, percentage, is_passed, remarks) VALUES
(1, 1, 85, 85.00, TRUE, 'Good understanding of Python basics'),
(1, 2, 92, 92.00, TRUE, 'Excellent SQL knowledge'),
(2, 1, 65, 65.00, TRUE, 'Satisfactory performance'),
(2, 3, 45, 45.00, FALSE, 'Needs improvement in calculus'),
(3, 2, 78, 78.00, TRUE, 'Good work');

-- Insert Student Answers
INSERT INTO student_answers (student_id, exam_id, question_id, given_answer, marks_obtained, is_correct) VALUES
(1, 1, 1, '8', 10, TRUE),
(1, 1, 2, '#', 10, TRUE),
(1, 1, 3, 'A list is a collection that can store multiple items in order.', 8, TRUE),
(2, 1, 1, '6', 0, FALSE),
(2, 1, 2, '#', 10, TRUE),
(2, 1, 3, 'A list stores multiple values.', 6, TRUE),
(1, 2, 4, 'SELECT', 10, TRUE),
(1, 2, 5, 'Structured Query Language', 10, TRUE),
(1, 2, 6, 'SELECT * FROM students WHERE age > 18;', 20, TRUE);