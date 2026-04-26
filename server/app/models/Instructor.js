import { db_config } from "../../config/database.js";

export const Instructor = {
    create: async (instructor) => {
        try {
            const stmt = `INSERT INTO instructors (user_id, department, office) VALUES (?, ?, ?)`;
            const [result] = await db_config.query(stmt, [instructor.user_id, instructor.department || null, instructor.office || null]);
            return result.insertId;
        } catch (error) {
            throw new Error(`Failed to create instructor: ${error.message}`);
        }
    },

    readById: async (instructor_id) => {
        try {
            const stmt = `SELECT i.*, u.first_name, u.last_name, u.email, u.is_active FROM instructors i JOIN users u ON i.user_id = u.user_id WHERE i.instructor_id = ?`;
            const [rows] = await db_config.query(stmt, [instructor_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch instructor: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const stmt = `SELECT i.*, u.first_name, u.last_name, u.email, u.is_active FROM instructors i JOIN users u ON i.user_id = u.user_id WHERE i.user_id = ?`;
            const [rows] = await db_config.query(stmt, [user_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch instructor by user: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const stmt = `SELECT i.*, u.first_name, u.last_name, u.email, u.is_active, u.last_login FROM instructors i JOIN users u ON i.user_id = u.user_id WHERE u.is_active = TRUE ORDER BY u.first_name`;
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch instructors: ${error.message}`);
        }
    },

    update: async (instructor_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.department !== undefined) { fields.push("department = ?"); values.push(updates.department); }
            if (updates.office !== undefined) { fields.push("office = ?"); values.push(updates.office); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(instructor_id);
            const stmt = `UPDATE instructors SET ${fields.join(", ")} WHERE instructor_id = ?`;
            const [result] = await db_config.query(stmt, values);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to update instructor: ${error.message}`);
        }
    },

    delete: async (instructor_id) => {
        try {
            const stmt = `DELETE FROM instructors WHERE instructor_id = ?`;
            const [result] = await db_config.query(stmt, [instructor_id]);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to delete instructor: ${error.message}`);
        }
    },

    readCourses: async (instructor_id) => {
        try {
            const stmt = `SELECT c.* FROM courses c JOIN course_instructors ci ON c.course_id = ci.course_id WHERE ci.instructor_id = ?`;
            const [rows] = await db_config.query(stmt, [instructor_id]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch instructor courses: ${error.message}`);
        }
    },

    readExams: async (instructor_id) => {
        try {
            const stmt = `SELECT e.*, c.course_name, cat.category_name FROM exams e JOIN courses c ON e.course_id = c.course_id LEFT JOIN categories cat ON e.category_id = cat.category_id WHERE e.instructor_id = ? ORDER BY e.created_at DESC`;
            const [rows] = await db_config.query(stmt, [instructor_id]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch instructor exams: ${error.message}`);
        }
    }
};