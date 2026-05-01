import { db_config } from "../../config/database.js";

export const ExamAttempt = {
    create: async (attempt) => {
        try {
            const [result] = await db_config.query(
                "INSERT INTO exam_attempts (student_id, exam_id, start_time, end_time, score) VALUES (?, ?, ?, ?, ?)",
                [attempt.student_id, attempt.exam_id, attempt.start_time || new Date(), attempt.end_time || null, attempt.score || null]
            );
            return result.insertId;
        } catch (error) {
            console.error(`Exam Attempt Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Exam Attempt: ${error}`);
        }
    },

    readByStudentId: async (student_id) => {
        try {
            const [attempts] = await db_config.query(`
                SELECT ea.*, e.title AS exam_title, c.course_name
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.exam_id
                JOIN courses c ON e.course_id = c.course_id
                WHERE ea.student_id = ?
                ORDER BY ea.start_time DESC
            `, [student_id]);
            return attempts;
        } catch (error) {
            console.error(`Failed To Fetch Student Attempts: ${error}`);
            throw new Error(`Error Occurred While Fetching Student Attempts: ${error}`);
        }
    },

    readByExamId: async (exam_id) => {
        try {
            const [attempts] = await db_config.query(`
                SELECT ea.*, u.first_name, u.last_name, u.email
                FROM exam_attempts ea
                JOIN students s ON ea.student_id = s.student_id
                JOIN users u ON s.user_id = u.user_id
                WHERE ea.exam_id = ?
                ORDER BY ea.start_time DESC
            `, [exam_id]);
            return attempts;
        } catch (error) {
            console.error(`Failed To Fetch Exam Attempts: ${error}`);
            throw new Error(`Error Occurred While Fetching Exam Attempts: ${error}`);
        }
    },

    readById: async (attempt_id) => {
        try {
            const [attempt] = await db_config.query("SELECT * FROM exam_attempts WHERE attempt_id = ?", [attempt_id]);
            return attempt[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch Attempt: ${error}`);
            throw new Error(`Error Occurred While Fetching Attempt: ${error}`);
        }
    },

    submit: async (attempt_id, end_time, score) => {
        try {
            const [result] = await db_config.query(
                "UPDATE exam_attempts SET end_time = ?, score = ? WHERE attempt_id = ?",
                [end_time || new Date(), score, attempt_id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Exam Attempt Submit Error: ${error}`);
            throw new Error(`Error Occurred While Submitting Exam Attempt: ${error}`);
        }
    },
};