import { db_config } from "../../config/database.js";

export const Question = {
    create: async (question) => {
        try {
            const stmt = `
                INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks, question_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db_config.query(stmt, [
                question.exam_id,
                question.question_text,
                question.question_type,
                question.options ? JSON.stringify(question.options) : null,
                question.correct_answer,
                question.marks || 1,
                question.question_order || 1,
            ]);
            return result.insertId;
        } catch (error) {
            console.error(`Question Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Question: ${error}`);
        }
    },

    readByExamId: async (exam_id) => {
        try {
            const [questions] = await db_config.query(
                "SELECT * FROM questions WHERE exam_id = ? ORDER BY question_order ASC",
                [exam_id]
            );
            return questions.map(q => ({
                ...q,
                options: q.options ? (typeof q.options === "string" ? JSON.parse(q.options) : q.options) : null,
            }));
        } catch (error) {
            console.error(`Failed To Fetch Questions: ${error}`);
            throw new Error(`Error Occurred While Fetching Questions: ${error}`);
        }
    },

    readById: async (question_id) => {
        try {
            const [question] = await db_config.query("SELECT * FROM questions WHERE question_id = ?", [question_id]);
            if (question[0] && question[0].options) {
                question[0].options = typeof question[0].options === "string" ? JSON.parse(question[0].options) : question[0].options;
            }
            return question[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch Question: ${error}`);
            throw new Error(`Error Occurred While Fetching Question: ${error}`);
        }
    },

    update: async (question_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.question_text !== undefined) { fields.push("question_text = ?"); values.push(updates.question_text); }
            if (updates.question_type !== undefined) { fields.push("question_type = ?"); values.push(updates.question_type); }
            if (updates.options !== undefined) { fields.push("options = ?"); values.push(JSON.stringify(updates.options)); }
            if (updates.correct_answer !== undefined) { fields.push("correct_answer = ?"); values.push(updates.correct_answer); }
            if (updates.marks !== undefined) { fields.push("marks = ?"); values.push(updates.marks); }
            if (updates.question_order !== undefined) { fields.push("question_order = ?"); values.push(updates.question_order); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(question_id);
            const [result] = await db_config.query(`UPDATE questions SET ${fields.join(", ")} WHERE question_id = ?`, values);
            return result.affectedRows;
        } catch (error) {
            console.error(`Question Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Question: ${error}`);
        }
    },

    delete: async (question_id) => {
        try {
            const [result] = await db_config.query("DELETE FROM questions WHERE question_id = ?", [question_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Question Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Question: ${error}`);
        }
    },
};