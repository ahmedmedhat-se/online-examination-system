import { db_config } from "../../config/database.js";

export const Course = {
    create: async (course) => {
        try {
            const stmt = `INSERT INTO courses (course_code, course_name, description, credit_hours) VALUES (?, ?, ?, ?)`;
            const [result] = await db_config.query(stmt, [course.course_code, course.course_name, course.description || null, course.credit_hours || 3]);
            return result.insertId;
        } catch (error) {
            throw new Error(`Failed to create course: ${error.message}`);
        }
    },

    readById: async (course_id) => {
        try {
            const stmt = `SELECT * FROM courses WHERE course_id = ?`;
            const [rows] = await db_config.query(stmt, [course_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch course: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const stmt = `SELECT c.*, COUNT(e.exam_id) as exam_count FROM courses c LEFT JOIN exams e ON c.course_id = e.course_id GROUP BY c.course_id ORDER BY c.course_name`;
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch courses: ${error.message}`);
        }
    },

    update: async (course_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.course_code !== undefined) { fields.push("course_code = ?"); values.push(updates.course_code); }
            if (updates.course_name !== undefined) { fields.push("course_name = ?"); values.push(updates.course_name); }
            if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }
            if (updates.credit_hours !== undefined) { fields.push("credit_hours = ?"); values.push(updates.credit_hours); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(course_id);
            const stmt = `UPDATE courses SET ${fields.join(", ")} WHERE course_id = ?`;
            const [result] = await db_config.query(stmt, values);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to update course: ${error.message}`);
        }
    },

    delete: async (course_id) => {
        try {
            const stmt = `DELETE FROM courses WHERE course_id = ?`;
            const [result] = await db_config.query(stmt, [course_id]);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to delete course: ${error.message}`);
        }
    }
};