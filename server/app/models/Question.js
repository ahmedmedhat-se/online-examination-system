import { db_config } from "../../config/database.js";

export const Question = {
    create: async (question) => {
        try {
            const stmt = `
                INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db_config.query(stmt, [
                question.exam_id,
                question.question_text,
                question.question_type,
                question.options,
                question.correct_answer,
                question.marks
            ]);
            return result.insertId;
        } catch (error) {
            console.error(`Question Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Question: ${error}`);
        }
    },

    readById: async (question_id) => {
        try {
            const [rows] = await db_config.query(
                "SELECT * FROM questions WHERE question_id = ?",
                [question_id]
            );
            if (rows.length === 0) return null;
            if (rows[0].options && typeof rows[0].options === 'string') {
                try {
                    rows[0].options = JSON.parse(rows[0].options);
                } catch (e) {
                }
            }
            return rows[0];
        } catch (error) {
            console.error(`Failed To Fetch Question: ${error}`);
            throw new Error(`Error Occurred While Fetching Question: ${error}`);
        }
    },

    readByExamId: async (exam_id) => {
        try {
            const [rows] = await db_config.query(
                "SELECT * FROM questions WHERE exam_id = ? ORDER BY question_id ASC",
                [exam_id]
            );
            rows.forEach(row => {
                if (row.options && typeof row.options === 'string') {
                    try {
                        row.options = JSON.parse(row.options);
                    } catch (e) {
                    }
                }
            });
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Exam Questions: ${error}`);
            throw new Error(`Error Occurred While Fetching Exam Questions: ${error}`);
        }
    },

    update: async (question_id, updates) => {
        try {
            const fields = [];
            const values = [];
            const allowedFields = ["question_text", "question_type", "options", "correct_answer", "marks"];
            
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(updates[field]);
                }
            });
            
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(question_id);
            
            const [result] = await db_config.query(
                `UPDATE questions SET ${fields.join(", ")} WHERE question_id = ?`,
                values
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Question Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Question: ${error}`);
        }
    },

    delete: async (question_id) => {
        try {
            const [result] = await db_config.query(
                "DELETE FROM questions WHERE question_id = ?",
                [question_id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Question Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Question: ${error}`);
        }
    },

    deleteByExamId: async (exam_id) => {
        try {
            const [result] = await db_config.query(
                "DELETE FROM questions WHERE exam_id = ?",
                [exam_id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Questions Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Exam Questions: ${error}`);
        }
    }
};