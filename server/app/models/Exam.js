import { db_config } from "../../database/mysql.js"

export const Exam = {
    create: async (exam) => {
        try {
            const stmt = `
                INSERT INTO exams (title, description, duration_minutes, total_marks, passing_marks, start_time, end_time, is_published, course_id, category_id, instructor_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db_config.query(stmt, [
                exam.title,
                exam.description || null,
                exam.duration_minutes,
                exam.total_marks,
                exam.passing_marks,
                exam.start_time,
                exam.end_time,
                exam.is_published || false,
                exam.course_id,
                exam.category_id || null,
                exam.instructor_id,
            ]);
            return result.insertId;
        } catch (error) {
            console.error(`Exam Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Exam: ${error}`);
        }
    },

    readAll: async () => {
        try {
            const [exams] = await db_config.query(`
                SELECT e.*, c.course_name, c.course_code, cat.category_name,
                       u.first_name AS instructor_first_name, u.last_name AS instructor_last_name
                FROM exams e
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                JOIN instructors i ON e.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                ORDER BY e.start_time DESC
            `);
            return exams;
        } catch (error) {
            console.error(`Failed To Fetch Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Exams: ${error}`);
        }
    },

    readById: async (exam_id) => {
        try {
            const [exam] = await db_config.query(`
                SELECT e.*, c.course_name, c.course_code, cat.category_name,
                       u.first_name AS instructor_first_name, u.last_name AS instructor_last_name
                FROM exams e
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                JOIN instructors i ON e.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE e.exam_id = ?
            `, [exam_id]);
            return exam[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch Exam: ${error}`);
            throw new Error(`Error Occurred While Fetching Exam: ${error}`);
        }
    },

    readByInstructorId: async (instructor_id) => {
        try {
            const [exams] = await db_config.query(`
                SELECT e.*, c.course_name, c.course_code, cat.category_name
                FROM exams e
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                WHERE e.instructor_id = ?
                ORDER BY e.start_time DESC
            `, [instructor_id]);
            return exams;
        } catch (error) {
            console.error(`Failed To Fetch Instructor Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Instructor Exams: ${error}`);
        }
    },

    readByCourseId: async (course_id) => {
        try {
            const [exams] = await db_config.query(`
                SELECT e.*, cat.category_name
                FROM exams e
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                WHERE e.course_id = ?
                ORDER BY e.start_time DESC
            `, [course_id]);
            return exams;
        } catch (error) {
            console.error(`Failed To Fetch Course Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Course Exams: ${error}`);
        }
    },

    update: async (exam_id, updates) => {
        try {
            const fields = [];
            const values = [];
            const allowedFields = ["title", "description", "duration_minutes", "total_marks", "passing_marks", "start_time", "end_time", "is_published", "course_id", "category_id"];
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(updates[field]);
                }
            });
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(exam_id);
            const [result] = await db_config.query(`UPDATE exams SET ${fields.join(", ")} WHERE exam_id = ?`, values);
            return result.affectedRows;
        } catch (error) {
            console.error(`Exam Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Exam: ${error}`);
        }
    },

    delete: async (exam_id) => {
        try {
            const [result] = await db_config.query("DELETE FROM exams WHERE exam_id = ?", [exam_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Exam Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Exam: ${error}`);
        }
    },

    enrollStudent: async (exam_id, student_id) => {
        try {
            const [result] = await db_config.query(
                "INSERT INTO exam_enrollments (exam_id, student_id) VALUES (?, ?)",
                [exam_id, student_id]
            );
            return result.insertId;
        } catch (error) {
            console.error(`Exam Enrollment Error: ${error}`);
            throw new Error(`Error Occurred While Enrolling Student: ${error}`);
        }
    },

    getEnrolledStudents: async (exam_id) => {
        try {
            const [rows] = await db_config.query(`
                SELECT s.*, u.first_name, u.last_name, u.email, ee.enrolled_at
                FROM exam_enrollments ee
                JOIN students s ON ee.student_id = s.student_id
                JOIN users u ON s.user_id = u.user_id
                WHERE ee.exam_id = ?
            `, [exam_id]);
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Enrolled Students: ${error}`);
            throw new Error(`Error Occurred While Fetching Enrolled Students: ${error}`);
        }
    },

    getStudentExams: async (student_id) => {
        try {
            const [rows] = await db_config.query(`
                SELECT e.*, c.course_name, c.course_code, ee.enrolled_at
                FROM exam_enrollments ee
                JOIN exams e ON ee.exam_id = e.exam_id
                JOIN courses c ON e.course_id = c.course_id
                WHERE ee.student_id = ?
                ORDER BY e.start_time DESC
            `, [student_id]);
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Student Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Student Exams: ${error}`);
        }
    },
};