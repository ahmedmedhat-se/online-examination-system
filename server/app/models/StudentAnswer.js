import { db_config } from "../../config/database.js";

export const StudentAnswer = {
    create: async (answer) => {
        try {
            const [result] = await db_config.query(
                "INSERT INTO student_answers (attempt_id, question_id, given_answer, marks_obtained) VALUES (?, ?, ?, ?)",
                [answer.attempt_id, answer.question_id, answer.given_answer, answer.marks_obtained || 0]
            );
            return result.insertId;
        } catch (error) {
            console.error(`Student Answer Creation Error: ${error}`);
            throw new Error(`Error Occurred While Saving Student Answer: ${error}`);
        }
    },

    readByAttemptId: async (attempt_id) => {
        try {
            const [answers] = await db_config.query(`
                SELECT sa.*, q.question_text, q.question_type, q.correct_answer, q.marks AS question_marks
                FROM student_answers sa
                JOIN questions q ON sa.question_id = q.question_id
                WHERE sa.attempt_id = ?
                ORDER BY q.question_order ASC
            `, [attempt_id]);
            return answers;
        } catch (error) {
            console.error(`Failed To Fetch Student Answers: ${error}`);
            throw new Error(`Error Occurred While Fetching Student Answers: ${error}`);
        }
    },

    updateMarks: async (answer_id, marks_obtained) => {
        try {
            const [result] = await db_config.query(
                "UPDATE student_answers SET marks_obtained = ? WHERE answer_id = ?",
                [marks_obtained, answer_id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Student Answer Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Student Answer Marks: ${error}`);
        }
    },
};